
const gradeProdutos = document.getElementById("grade-produtos");
const botaoAdicionar = document.getElementById("adicionar");
const dialogo = document.getElementById("dialogo-produto");
const formulario = document.getElementById("form-produto");

const campoId = document.getElementById("id-produto");
const campoNome = document.getElementById("nome-produto");
const campoPreco = document.getElementById("preco-produto");
const campoImagem = document.getElementById("imagem-produto");

// Abre o formulário
botaoAdicionar.addEventListener("click", () => {
    formulario.reset();
    campoId.value = "";
    dialogo.showModal();
});

// Fecha o formulário
document.getElementById("fechar").addEventListener("click", () => {
    dialogo.close();
});

document.getElementById("cancelar").addEventListener("click", () => {
    dialogo.close();
});

// Lê a imagem selecionada
function lerImagem(arquivo) {
    return new Promise((resolve, reject) => {
        if (!arquivo) {
            resolve("");
            return;
        }

        if (!arquivo.type.startsWith("image/")) {
            reject(new Error("Selecione uma imagem válida."));
            return;
        }

        const leitor = new FileReader();

        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(new Error("Erro ao carregar imagem."));

        leitor.readAsDataURL(arquivo);
    });
}

// Mostra os produtos
function mostrarProdutos() {
    const produtos = obterProdutos();
    gradeProdutos.innerHTML = "";

    if (produtos.length === 0) {
        gradeProdutos.innerHTML = "<p>Nenhum produto cadastrado.</p>";
        return;
    }

    produtos.forEach((produto) => {
        const card = document.createElement("div");
        card.classList.add("produto-card");

        if (produto.imagem) {
            const imagem = document.createElement("img");
            imagem.src = produto.imagem;
            imagem.alt = produto.nome;
            imagem.classList.add("imagem-produto");
            card.appendChild(imagem);
        }

        const nome = document.createElement("h3");
        nome.textContent = produto.nome;

        const preco = document.createElement("p");
        preco.textContent = moeda(Number(produto.preco));

        const acoes = document.createElement("div");
        acoes.classList.add("produto-acoes");

        const editar = document.createElement("button");
        editar.textContent = "✏️";
        editar.type = "button";
        editar.addEventListener("click", () => editarProduto(produto.id));

        const excluir = document.createElement("button");
        excluir.textContent = "🗑️";
        excluir.type = "button";
        excluir.addEventListener("click", () => excluirProduto(produto.id));

        acoes.append(editar, excluir);
        card.append(nome, preco, acoes);

        gradeProdutos.appendChild(card);
    });
}

// Cadastra ou atualiza um produto
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);

    if (!nome || !Number.isFinite(preco) || preco <= 0) {
        alert("Preencha o nome e informe um preço válido.");
        return;
    }

    const produtos = obterProdutos();
    const id = campoId.value;

    const existente = produtos.find(
        (produto) => String(produto.id) === id
    );

    try {
        const arquivo = campoImagem.files[0];
        const imagem = await lerImagem(arquivo);

        const produto = {
            id: existente ? existente.id : Date.now(),
            nome: nome,
            preco: preco,
            imagem: imagem || (existente?.imagem || "")
        };

        if (existente) {
            const indice = produtos.findIndex(
                (item) => String(item.id) === id
            );
            produtos[indice] = produto;
        } else {
            produtos.push(produto);
        }

        gravarProdutos(produtos);
        mostrarProdutos();

        formulario.reset();
        dialogo.close();

    } catch (erro) {
        alert(erro.message);
    }
});

// Edita um produto
function editarProduto(id) {
    const produtos = obterProdutos();

    const produto = produtos.find(
        (item) => String(item.id) === String(id)
    );

    if (!produto) return;

    campoId.value = produto.id;
    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoImagem.value = "";

    dialogo.showModal();
}

// Exclui um produto
function excluirProduto(id) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    const produtos = obterProdutos();

    const atualizados = produtos.filter(
        (produto) => String(produto.id) !== String(id)
    );

    gravarProdutos(atualizados);
    mostrarProdutos();
}

// Carrega os produtos
mostrarProdutos();
