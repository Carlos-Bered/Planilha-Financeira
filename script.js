const btnAdicionar = document.getElementById("adicionarConta");
const modal = document.getElementById("modal");
const fechar = document.getElementById("closeModal");
const formConta = document.getElementById("formConta");
const listaContasMobile = document.getElementById("listaContasMobile");

let contas = JSON.parse(localStorage.getItem("contas")) || [];
let contaEditandoIndex = null;

function atualizarCartoes() {
    listaContasMobile.innerHTML = '';
    contas.forEach((conta, index) => {
        const novoCartao = document.createElement("div");
        novoCartao.classList.add("card");

        const valorRestante = (conta.valor - (conta.parcelasPagas * (conta.valor / conta.parcelas))).toFixed(2);

        novoCartao.innerHTML = `
            <h3>${conta.nome}</h3>
            <p>Vencimento: ${conta.vencimento}</p>
            <p>Valor Total: R$ ${parseFloat(conta.valor).toFixed(2)}</p>
            <p>Parcelas: ${conta.parcelas}</p>
            <p>Parcelas Pagas: ${conta.parcelasPagas}</p>
            <p>Valor Restante: R$ ${valorRestante}</p>
            <div class="acoes">
                <button class="pagar" onclick="confirmarPagamento(${index})">${conta.pago ? 'Pago' : 'Pagar'}</button>
                <button class="deletar" onclick="deletarConta(${index})">Deletar</button>
                <button class="editar" onclick="editarConta(${index})">Editar</button>
            </div>
        `;
        listaContasMobile.appendChild(novoCartao);
    });
}

btnAdicionar.addEventListener("click", () => {
    contaEditandoIndex = null;
    formConta.reset();
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
    const valorParcela = parseFloat(document.getElementById("valorParcela").value);

    if (contaEditandoIndex !== null) {
        contas[contaEditandoIndex] = {
            nome: nomeConta,
            vencimento: dataVencimento,
            valor: valor,
            parcelas: parcelas,
            parcelasPagas: 0,
            pago: false
        };
    } else {
        contas.push({
            nome: nomeConta,
            vencimento: dataVencimento,
            valor: valor,
            parcelas: parcelas,
            parcelasPagas: 0,
            pago: false
        });
    }

    localStorage.setItem("contas", JSON.stringify(contas));
    modal.style.display = "none";
    atualizarCartoes();
});

function confirmarPagamento(index) {
    if (!contas[index].pago) {
        contas[index].pago = true;
        localStorage.setItem("contas", JSON.stringify(contas));
        atualizarCartoes();
    }
}

function deletarConta(index) {
    contas.splice(index, 1);
    localStorage.setItem("contas", JSON.stringify(contas));
    atualizarCartoes();
}

function editarConta(index) {
    contaEditandoIndex = index;
    const conta = contas[index];
    document.getElementById("nomeConta").value = conta.nome;
    document.getElementById("dataVencimento").value = conta.vencimento;
    document.getElementById("valorTotal").value = conta.valor;
    document.getElementById("parcelamento").value = conta.parcelas;
    document.getElementById("valorParcela").value = conta.valor / conta.parcelas;
    modal.style.display = "flex";
}

atualizarCartoes();
