const btnAdicionar = document.getElementById("adicionarConta");
const modal = document.getElementById("modal");
const fecharModal = document.getElementById("fecharModal");
const formConta = document.getElementById("formConta");
const listaContasMobile = document.getElementById("listaContasMobile");

let contas = JSON.parse(localStorage.getItem("contas")) || [];
let contaEditandoIndex = null;

if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("Permissão para notificações concedida!");
        }
    });
}

function atualizarCartoes() {
    listaContasMobile.innerHTML = '';
    contas.forEach((conta, index) => {
        const novoCartao = document.createElement("div");
        novoCartao.classList.add("card");

        const valorRestante = (conta.valor - (conta.parcelasPagas * (conta.valor / conta.parcelas))).toFixed(2);
        
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
    if (!data) return "Data Inválida";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function calcularUltimaParcela(dataVencimento, parcelas, parcelasPagas) {
    if (!dataVencimento) return "Data Inválida";
    const vencimento = new Date(dataVencimento);
    const mesesFaltando = parcelas - parcelasPagas - 1;
    vencimento.setMonth(vencimento.getMonth() + mesesFaltando);
    return vencimento.toISOString().split('T')[0];
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
    const conta = contas[index];
    
    document.getElementById("nomeConta").value = conta.nome;
    document.getElementById("dataVencimento").value = conta.vencimento;
    document.getElementById("valorTotal").value = conta.valor;
    document.getElementById("parcelamento").value = conta.parcelas;
    
    contaEditandoIndex = index; 
    modal.style.display = "flex";
}

btnAdicionar.addEventListener("click", () => {
    contaEditandoIndex = null; 
    formConta.reset();
    modal.style.display = "flex";
});

fecharModal.addEventListener("click", () => {
    modal.style.display = "none";
});

fecharModal.addEventListener("touchstart", () => {
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

function verificarContasAVencer() {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    contas.forEach(conta => {
        const vencimento = new Date(conta.vencimento);
        if (vencimento.toDateString() === amanha.toDateString()) {
            if (Notification.permission === "granted") {
                new Notification(`Atenção: A conta ${conta.nome} vence amanhã!`, {
                    body: `Valor: R$ ${conta.valor.toFixed(2)}. Não se esqueça de pagar!`,
                });
            }
        }
    });
}

verificarContasAVencer();
atualizarCartoes();
