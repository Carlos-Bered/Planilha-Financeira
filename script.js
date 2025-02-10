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

        novoCartao.innerHTML = `
            <h3>${conta.nome}</h3>
            <p>Vencimento: ${conta.vencimento}</p>
            <p>Valor: R$ ${parseFloat(conta.valor).toFixed(2)}</p>
            <p>Parcelas: ${conta.parcelas}</p>
            <div class="acoes">
                <button class="pagar" onclick="pagarConta(${index})">${conta.pago ? 'Pago' : 'Pagar'}</button>
                <button class="deletar" onclick="deletarConta(${index})">Deletar</button>
            </div>
        `;
        
        listaContasMobile.appendChild(novoCartao);
    });
}


function pagarConta(index) {
    contas[index].pago = true;
    contas[index].parcelas -= 1;
    if (contas[index].parcelas <= 0) {
        contas.splice(index, 1);
    }
    localStorage.setItem("contas", JSON.stringify(contas));
    atualizarCartoes();
}


function deletarConta(index) {
    contas.splice(index, 1);
    localStorage.setItem("contas", JSON.stringify(contas));
    atualizarCartoes();
}


formConta.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const nomeConta = document.getElementById("nomeConta").value;
    const dataVencimento = document.getElementById("dataVencimento").value;
    const valor = document.getElementById("valor").value;
    const parcelas = document.getElementById("parcelamento").value;
    
    contas.push({
        nome: nomeConta,
        vencimento: dataVencimento,
        valor: parseFloat(valor),
        parcelas: parseInt(parcelas),
        pago: false,
    });
    
    localStorage.setItem("contas", JSON.stringify(contas)); 
    atualizarCartoes();
    modal.style.display = "none";
    formConta.reset();
});


btnAdicionar.addEventListener("click", () => {
    modal.style.display = "flex";
});


fechar.addEventListener("click", () => {
    modal.style.display = "none";
});


atualizarCartoes();
