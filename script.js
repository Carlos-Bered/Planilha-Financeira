// Variáveis
const btnAdicionar = document.getElementById("adicionarConta");
const modal = document.getElementById("modal");
const fechar = document.querySelector(".fechar");
const formConta = document.getElementById("formConta");
const listaContasMobile = document.getElementById("listaContasMobile");

let contas = JSON.parse(localStorage.getItem("contas")) || [];
let contaEditandoIndex = null;

// Atualiza os cartões de contas
function atualizarCartoes() {
    listaContasMobile.innerHTML = ''; // Limpa os cartões
    contas.forEach((conta, index) => {
        const novoCartao = document.createElement("div");
        novoCartao.classList.add("card");
        const valorRestante = (conta.valor - (conta.parcelasPagas * (conta.valor / conta.parcelas))).toFixed(2);

        // Calcular a data da última parcela (fixa)
        const ultimaParcela = calcularUltimaParcela(conta.vencimento, conta.parcelas);

        // Formatação da data
        novoCartao.innerHTML = 
            `<h3>${conta.nome}</h3>
            <p>Vencimento: ${formatarData(conta.vencimento)}</p>
            <p>Valor Total: R$ ${parseFloat(conta.valor).toFixed(2)}</p>
            <p>Valor de Cada Parcela: R$ ${parseFloat(conta.valorParcela).toFixed(2)}</p>
            <p>Parcelas: ${conta.parcelas}</p>
            <p>Parcelas Pagas: ${conta.parcelasPagas}</p>
            <p>Valor Restante: R$ ${valorRestante}</p>
            <p>Última Parcela: ${ultimaParcela}</p> <!-- Data da última parcela -->
            <div class="acoes">
                <button class="pagar" onclick="confirmarPagamento(${index})">${conta.pago ? 'Pago' : 'Pagar'}</button>
                <button class="deletar" onclick="deletarConta(${index})">Deletar</button>
                <button class="editar" onclick="editarConta(${index})">Editar</button>
            </div>`;
        listaContasMobile.appendChild(novoCartao);
    });
}

// Formatar data
function formatarData(data) {
    if (typeof data === 'string') {
        data = new Date(data);
    }

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses começam de 0
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Calcular a data da última parcela (fixa)
function calcularUltimaParcela(dataVencimento, parcelas) {
    const data = new Date(dataVencimento);
    data.setMonth(data.getMonth() + parcelas - 1); // Adiciona o número de parcelas - 1
    return formatarData(data); // Formata a data de vencimento final
}

// Confirmar pagamento
function confirmarPagamento(index) {
    const conta = contas[index];
    const confirmar = confirm("Tem certeza de que deseja pagar esta conta?");
    if (confirmar) {
        if (conta.parcelasPagas < conta.parcelas) {
            conta.parcelasPagas += 1;
            const dataVencimento = new Date(conta.vencimento);
            dataVencimento.setMonth(dataVencimento.getMonth() + 1);
            conta.vencimento = dataVencimento.toISOString().split('T')[0];
        } 
        if (conta.parcelasPagas === conta.parcelas) {
            conta.pago = true;
        }
        localStorage.setItem("contas", JSON.stringify(contas));
        atualizarCartoes();
    }
}

// Deletar conta
function deletarConta(index) {
    const confirmar = confirm("Tem certeza de que deseja deletar esta conta?");
    if (confirmar) {
        contas.splice(index, 1);
        localStorage.setItem("contas", JSON.stringify(contas));
        atualizarCartoes();
    }
}

// Editar conta
function editarConta(index) {
    const conta = contas[index];
    document.getElementById("nomeConta").value = conta.nome;
    document.getElementById("dataVencimento").value = conta.vencimento;
    document.getElementById("valorTotal").value = conta.valor;
    document.getElementById("parcelamento").value = conta.parcelas;
    
    contaEditandoIndex = index; 
    modal.style.display = "flex";
}

// Abrir o modal
btnAdicionar.addEventListener("click", () => {
    contaEditandoIndex = null;
    formConta.reset();
    modal.style.display = "flex";
});

// Fechar o modal clicando no botão de fechar
fechar.addEventListener("click", () => {
    modal.style.display = "none";
});

// Fechar o modal clicando fora dele
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// Salvar conta ao submeter o formulário
formConta.addEventListener("submit", (event) => {
    event.preventDefault();

    const nomeConta = document.getElementById("nomeConta").value.trim();
    const dataVencimento = document.getElementById("dataVencimento").value;
    const valor = parseFloat(document.getElementById("valorTotal").value);
    const parcelas = parseInt(document.getElementById("parcelamento").value);

    // Verificação dos dados
    if (!nomeConta || !dataVencimento || isNaN(valor) || isNaN(parcelas) || parcelas <= 0) {
        alert("Por favor, preencha todos os campos corretamente!");
        return;
    }

    if (contaEditandoIndex !== null) {
        // Editar conta
        contas[contaEditandoIndex] = {
            nome: nomeConta,
            vencimento: dataVencimento,
            valor: valor,
            parcelas: parcelas,
            parcelasPagas: contas[contaEditandoIndex].parcelasPagas || 0,
            pago: contas[contaEditandoIndex].pago || false,
        };
    } else {
        // Adicionar nova conta
        contas.push({
            nome: nomeConta,
            vencimento: dataVencimento,
            valor: valor,
            parcelas: parcelas,
            parcelasPagas: 0,
            pago: false,
        });
    }

    // Atualizar o localStorage
    localStorage.setItem("contas", JSON.stringify(contas));
    atualizarCartoes();
    modal.style.display = "none";  // Fechar modal
    formConta.reset();
});

atualizarCartoes(); // Inicializa os cartões de contas
