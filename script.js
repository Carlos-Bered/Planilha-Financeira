const btnAdicionar = document.getElementById("adicionarConta");
const modal = document.getElementById("modal");
const fechar = document.querySelector(".fechar");
const formConta = document.getElementById("formConta");
const listaContasMobile = document.getElementById("listaContasMobile");

let contas = JSON.parse(localStorage.getItem("contas")) || [];
let contaEditandoIndex = null;

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function atualizarCartoes() {
    listaContasMobile.innerHTML = ''; 
    contas.forEach((conta, index) => {
        const novoCartao = document.createElement("div");
        novoCartao.classList.add("card");

                const valorParcela = conta.valor / conta.parcelas;

                const valorRestante = conta.valor - (conta.parcelasPagas * valorParcela);

                const dataVencimento = new Date(conta.vencimento);
        dataVencimento.setMonth(dataVencimento.getMonth() + conta.parcelasPagas);

        if (dataVencimento.getDate() !== new Date(conta.vencimento).getDate()) {
            dataVencimento.setDate(0); // Volta para o último dia do mês
        }

        const vencimentoFormatado = formatarData(dataVencimento.toISOString().split('T')[0]);

              const ultimaParcela = new Date(conta.vencimento);
        ultimaParcela.setMonth(ultimaParcela.getMonth() + conta.parcelas - 1);

               if (ultimaParcela.getDate() !== new Date(conta.vencimento).getDate()) {
            ultimaParcela.setDate(0);
        }

        const ultimaParcelaFormatada = formatarData(ultimaParcela.toISOString().split('T')[0]);

        novoCartao.innerHTML = 
            `<h3>${conta.nome}</h3>
            <p>Vencimento: ${vencimentoFormatado}</p>
            <p>Valor Total: ${formatarMoeda(conta.valor)}</p>
            <p>Valor de Cada Parcela: ${formatarMoeda(valorParcela)}</p>
            <p>Parcelas: ${conta.parcelas}</p>
            <p>Parcelas Pagas: ${conta.parcelasPagas}</p>
            <p>Valor Restante: ${formatarMoeda(valorRestante)}</p>
            <p>Última Parcela: ${ultimaParcelaFormatada}</p>
            <div class="acoes">
                <button class="pagar" onclick="confirmarPagamento(${index})">${conta.pago ? 'Pago' : 'Pagar'}</button>
                <button class="deletar" onclick="deletarConta(${index})">Deletar</button>
                <button class="editar" onclick="editarConta(${index})">Editar</button>
            </div>`;
        listaContasMobile.appendChild(novoCartao);
    });
}

function confirmarPagamento(index) {
    const conta = contas[index];
    const confirmar = confirm("Tem certeza de que deseja pagar esta conta?");
    if (confirmar) {
        if (conta.parcelasPagas < conta.parcelas) {
            conta.parcelasPagas += 1;
        }
        if (conta.parcelasPagas === conta.parcelas) {
            conta.pago = true;
        }
        localStorage.setItem("contas", JSON.stringify(contas));
        atualizarCartoes();
    }
}

function deletarConta(index) {
    const confirmar = confirm("Tem certeza de que deseja deletar esta conta?");
    if (confirmar) {
        contas.splice(index, 1);
        localStorage.setItem("contas", JSON.stringify(contas));
        atualizarCartoes();
    }
}

function editarConta(index) {
    const conta = contas[index];
    document.getElementById("nomeConta").value = conta.nome;
    document.getElementById("dataVencimento").value = conta.vencimento;
    document.getElementById("valorTotal").value = conta.valor.toFixed(2).replace(".", ","); // Exibir com vírgula
    document.getElementById("parcelamento").value = conta.parcelas;
    
    contaEditandoIndex = index; 
    modal.style.display = "flex";
}

btnAdicionar.addEventListener("click", () => {
    contaEditandoIndex = null;
    formConta.reset();
    modal.style.display = "flex";
});

fechar.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

formConta.addEventListener("submit", (event) => {
    event.preventDefault();

    const nomeConta = document.getElementById("nomeConta").value.trim();
    const dataVencimento = document.getElementById("dataVencimento").value;
    const valor = parseFloat(document.getElementById("valorTotal").value.replace(",", ".")); 
    const parcelas = parseInt(document.getElementById("parcelamento").value);

    if (!nomeConta || !dataVencimento || isNaN(valor) || isNaN(parcelas) || parcelas <= 0) {
        alert("Por favor, preencha todos os campos corretamente!");
        return;
    }

    if (contaEditandoIndex !== null) {
        
        contas[contaEditandoIndex] = {
            nome: nomeConta,
            vencimento: dataVencimento,
            valor: valor,
            parcelas: parcelas,
            parcelasPagas: contas[contaEditandoIndex].parcelasPagas || 0,
            pago: contas[contaEditandoIndex].pago || false,
        };
    } else {
        
        contas.push({
            nome: nomeConta,
            vencimento: dataVencimento,
            valor: valor,
            parcelas: parcelas,
            parcelasPagas: 0,
            pago: false,
        });
    }

    
    localStorage.setItem("contas", JSON.stringify(contas));
    atualizarCartoes();
    modal.style.display = "none";  
    formConta.reset();
});

atualizarCartoes(); 
