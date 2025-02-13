const btnAdicionar = document.getElementById("adicionarConta");
const modal = document.getElementById("modal");
const fechar = document.querySelector(".fechar");
const formConta = document.getElementById("formConta");
const listaContasMobile = document.getElementById("listaContasMobile");

let contas = JSON.parse(localStorage.getItem("contas")) || [];

function atualizarCartoes() {
    listaContasMobile.innerHTML = '';
    contas.forEach((conta, index) => {
        const novoCartao = document.createElement("div");
        novoCartao.classList.add("card");

        // Calcular o valor restante a pagar
        const valorRestante = (conta.valor - (conta.parcelasPagas * (conta.valor / conta.parcelas))).toFixed(2);

        // Calcular a data da última parcela
        const dataUltimaParcela = calcularUltimaParcela(conta.vencimento, conta.parcelas, conta.parcelasPagas);

        novoCartao.innerHTML = `
            <h3>${conta.nome}</h3>
            <p>Vencimento: ${formatarData(conta.vencimento)}</p>
            <p>Valor Total: R$ ${parseFloat(conta.valor).toFixed(2)}</p>
            <p>Parcelas: ${conta.parcelas}</p>
            <p>Parcelas Pagas: ${conta.parcelasPagas}</p>
            <p>Valor Restante: R$ ${valorRestante}</p>
            <p>Última Parcela: ${formatarData(dataUltimaParcela)}</p>
            <div class="acoes">
                <button class="pagar" onclick="confirmarPagamento(${index})">${conta.pago ? 'Pago' : 'Pagar'}</button>
                <button class="deletar" onclick="deletarConta(${index})">Deletar</button>
                <button class="editar" onclick="editarConta(${index})">Editar</button>
            </div>
        `;

        listaContasMobile.appendChild(novoCartao);
    });
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

// Função para calcular a data da última parcela
function calcularUltimaParcela(dataVencimento, parcelas, parcelasPagas) {
    const vencimento = new Date(dataVencimento);
    const mesesFaltando = parcelas - parcelasPagas - 1;
    vencimento.setMonth(vencimento.getMonth() + mesesFaltando); // Adiciona as parcelas restantes
    return vencimento.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

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

function deletarConta(index) {
    const confirmar = confirm("Tem certeza de que deseja deletar esta conta?");
    if (confirmar) {
        contas.splice(index, 1);
        localStorage.setItem("contas", JSON.stringify(contas));
        atualizarCartoes();
    }
}

function editarConta(index) {
    // Função para editar a conta, por enquanto, exibe os dados no console
    console.log(contas[index]);
}

btnAdicionar.addEventListener("click", () => {
    modal.style.display = "flex";
});

fechar.addEventListener("click", () => {
    modal.style.display = "none";
});

formConta.addEventListener("submit", (event) => {
    event.preventDefault();

    const nomeConta = document.getElementById("nomeConta").value.trim();
    const dataVencimento = document.getElementById("dataVencimento").value;
    const valor = parseFloat(document.getElementById("valorTotal").value);
    const parcelas = parseInt(document.getElementById("parcelamento").value);

    if (!nomeConta || !dataVencimento || isNaN(valor) || isNaN(parcelas) || parcelas <= 0) {
        alert("Por favor, preencha todos os campos corretamente!");
        return;
    }

    contas.push({
        nome: nomeConta,
        vencimento: dataVencimento,
        valor: valor,
        parcelas: parcelas,
        parcelasPagas: 0,
        pago: false,
    });

    localStorage.setItem("contas", JSON.stringify(contas));

    atualizarCartoes();
    modal.style.display = "none";
    formConta.reset();
});

atualizarCartoes();
