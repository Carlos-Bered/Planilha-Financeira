const btnAdicionar = document.getElementById("adicionarConta");
const modal = document.getElementById("modal");
const fechar = document.querySelector(".fechar");
const formConta = document.getElementById("formConta");
const listaContas = document.getElementById("listaContas"); 


let contas = JSON.parse(localStorage.getItem("contas")) || [];


function atualizarTabela() {
    listaContas.innerHTML = ''; 
    contas.forEach((conta) => {
        const novaLinha = document.createElement("tr");

        const cellNome = document.createElement("td");
        const cellDataVencimento = document.createElement("td");
        const cellValor = document.createElement("td");
        const cellComprovante = document.createElement("td");
        const cellPago = document.createElement("td");

        cellNome.textContent = conta.nome;
        cellDataVencimento.textContent = conta.vencimento;
        cellValor.textContent = `R$ ${parseFloat(conta.valor).toFixed(2)}`; 

        
        const botaoAnexar = document.createElement("button");
        botaoAnexar.textContent = "Anexar";
        botaoAnexar.addEventListener("click", () => {
            const inputFile = document.createElement("input");
            inputFile.type = "file";
            inputFile.accept = ".jpg, .jpeg, .png, .pdf"; 
            inputFile.style.display = "none";

            inputFile.addEventListener("change", () => {
                if (inputFile.files.length > 0) {
                    botaoAnexar.textContent = "Comprovante Anexado";
                    botaoAnexar.disabled = true; 
                }
            });

            inputFile.click(); 
        });

        cellComprovante.appendChild(botaoAnexar); 

        
        const pagoCheckbox = document.createElement("input");
        pagoCheckbox.type = "checkbox";
        cellPago.appendChild(pagoCheckbox);

        novaLinha.appendChild(cellNome);
        novaLinha.appendChild(cellDataVencimento);
        novaLinha.appendChild(cellValor);
        novaLinha.appendChild(cellComprovante);
        novaLinha.appendChild(cellPago);

        listaContas.appendChild(novaLinha);
    });
}


atualizarTabela();


btnAdicionar.addEventListener("click", () => {
    modal.style.display = "flex";
});


fechar.addEventListener("click", () => {
    modal.style.display = "none";
});


window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});


formConta.addEventListener("submit", (event) => {
    event.preventDefault(); 

    
    const nomeConta = document.getElementById("nomeConta").value;
    const dataVencimento = document.getElementById("dataVencimento").value;
    const valor = document.getElementById("valor").value;

    
    contas.push({
        nome: nomeConta,
        vencimento: dataVencimento,
        valor: parseFloat(valor)
    });

    
    localStorage.setItem("contas", JSON.stringify(contas));

    
    atualizarTabela();

    
    modal.style.display = "none";
    formConta.reset();
});


if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
            alert("Ative as notificações para receber lembretes de vencimento.");
        }
    });
}


function verificarVencimentos() {
    const hoje = new Date();

    contas.forEach((conta) => {
        const dataVencimento = new Date(conta.vencimento);
        const doisDiasAntes = new Date(dataVencimento);
        doisDiasAntes.setDate(dataVencimento.getDate() - 2);

        if (hoje.toDateString() === doisDiasAntes.toDateString()) {
            enviarNotificacao(conta.nome, conta.vencimento);
        }
    });
}


function enviarNotificacao(nomeConta, dataVencimento) {
    if (Notification.permission === "granted") {
        new Notification("Lembrete de Pagamento", {
            body: `A conta "${nomeConta}" vence em 2 dias (${dataVencimento}).`,
            icon: "img/SITE ICON.png"
        });
    }
}


setInterval(verificarVencimentos, 24 * 60 * 60 * 1000); 


verificarVencimentos();
