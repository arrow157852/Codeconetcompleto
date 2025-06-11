document.addEventListener("DOMContentLoaded", async () => {
  const token = getAuthToken();
  if (!token) {
    console.log(
      "Publicar JS: Token JWT não encontrado. Redirecionando para login."
    );
    window.location.href = "../pages/login.html";
    return;
  }
  console.log("Publicar JS: Token JWT encontrado. Usuário autenticado.");

  const userId = localStorage.getItem("userId");
  console.log("ID do usuário (do localStorage, após autenticação):", userId);

  const CONFIG = {
    API_PUBLICACAO_URL:
      "https://back-production-87f2.up.railway.app/api/v1/Posts",
    MESSAGE_DISPLAY_TIME: 3000,
    PERFIL_PAGE: "/pages/perfil.html",
    CLOUDINARY: {
      UPLOAD_URL: "https://api.cloudinary.com/v1_1/dzzk4ybjo/image/upload",
      UPLOAD_PRESET: "codeconnect_upload",
    },
    LOGIN_PAGE: "../pages/login.html",
  };

  const MESSAGES = {
    errors: {
      notLoggedIn: "Faça login para publicar.",
      requiredFields: "Preencha todos os campos obrigatórios.",
      invalidImage: "Selecione uma imagem válida (PNG, JPG, JPEG, GIF).",
      networkError:
        "Erro de conexão. Verifique sua internet e tente novamente.",
      serverError: "Erro interno do servidor. Tente novamente mais tarde.",
      uploadFailed:
        "Falha ao enviar imagem para o servidor de arquivos. Tente novamente.",
      nameTooShort: "O nome do projeto deve ter pelo menos 3 caracteres.",
      descriptionTooShort: "A descrição deve ter pelo menos 10 caracteres.",
    },
    success: {
      postCreated: "Projeto publicado com sucesso!",
    },
  };

  const DOM = {
    form: null,
    nomeProjeto: null,
    descricao: null,
    mensagem: null,
    btnPublicar: null,
    btnPublicarText: null,
    btnPublicarLoader: null,
    btnDescartar: null,
    btnUpload: null,
    inputUpload: null,
    imagemPrincipal: null,
    nomeImagem: null,
    contadorCaracteres: null,

    init: () => {
      DOM.form = document.querySelector("form");
      DOM.nomeProjeto = document.getElementById("nome");
      DOM.descricao = document.getElementById("descricao");
      DOM.mensagem = document.getElementById("mensagem-publicar");
      DOM.btnPublicar = document.getElementById("btn-publicar");
      DOM.btnPublicarText = DOM.btnPublicar
        ? DOM.btnPublicar.querySelector(".button-text")
        : null;
      DOM.btnPublicarLoader = DOM.btnPublicar
        ? DOM.btnPublicar.querySelector(".loader")
        : null;
      DOM.btnDescartar = document.getElementById("btn-descartar");
      DOM.btnUpload = document.getElementById("upload-btn");
      DOM.inputUpload = document.getElementById("image-upload");
      DOM.imagemPrincipal = document.querySelector(".main-imagem");
      DOM.nomeImagem = document.querySelector(".container-imagem-nome p");
      DOM.contadorCaracteres = document.getElementById("contador-caracteres");

      if (!DOM.form) console.warn("DOM.init: Elemento 'form' não encontrado.");
      if (!DOM.nomeProjeto)
        console.warn("DOM.init: Elemento 'nome' não encontrado.");
      if (!DOM.descricao)
        console.warn("DOM.init: Elemento 'descricao' não encontrado.");
      if (!DOM.mensagem)
        console.warn("DOM.init: Elemento 'mensagem-publicar' não encontrado.");
      if (!DOM.btnPublicar)
        console.warn("DOM.init: Elemento 'btn-publicar' não encontrado.");
      if (!DOM.btnPublicarText)
        console.warn(
          "DOM.init: Elemento '.button-text' dentro de btn-publicar não encontrado."
        );
      if (!DOM.btnPublicarLoader)
        console.warn(
          "DOM.init: Elemento '.loader' dentro de btn-publicar não encontrado."
        );
      if (!DOM.btnDescartar)
        console.warn("DOM.init: Elemento 'btn-descartar' não encontrado.");
      if (!DOM.btnUpload)
        console.warn("DOM.init: Elemento 'upload-btn' não encontrado.");
      if (!DOM.inputUpload)
        console.warn("DOM.init: Elemento 'image-upload' não encontrado.");
      if (!DOM.imagemPrincipal)
        console.warn("DOM.init: Elemento '.main-imagem' não encontrado.");
      if (!DOM.nomeImagem)
        console.warn(
          "DOM.init: Elemento '.container-imagem-nome p' não encontrado."
        );
      if (!DOM.contadorCaracteres)
        console.warn(
          "DOM.init: Elemento 'contador-caracteres' não encontrado."
        );
    },
  };

  const API = {
    criarPublicacao: async (dadosDoPost, timeout = 8000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn("API.criarPublicacao: Requisição abortada por timeout.");
      }, timeout);

      try {
        const response = await authenticatedFetch(CONFIG.API_PUBLICACAO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosDoPost),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json().catch((err) => {
          console.error(
            "API.criarPublicacao: Erro ao parsear JSON da resposta:",
            err,
            "Resposta bruta:",
            response.status,
            response.statusText
          );
          return { message: MESSAGES.errors.serverError };
        });

        if (!response.ok) {
          console.error(
            "API.criarPublicacao: Erro na resposta da API:",
            response.status,
            responseData
          );
          throw new Error(responseData.message || MESSAGES.errors.serverError);
        }

        return responseData;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("API.criarPublicacao: Erro na requisição:", error);
        if (error.name === "AbortError") {
          throw new Error("A requisição demorou muito tempo. Tente novamente.");
        }
        throw error;
      }
    },
  };

  const Utils = {
    exibirMensagem: (elemento, texto, tipo = "erro") => {
      if (!elemento) {
        console.warn(
          "Utils.exibirMensagem: Elemento de mensagem não encontrado."
        );
        return;
      }
      elemento.textContent = texto;
      elemento.className = `mensagem-${tipo}`;
      elemento.style.display = "block";
      setTimeout(
        () => (elemento.style.display = "none"),
        CONFIG.MESSAGE_DISPLAY_TIME
      );
    },

    validarFormulario: () => {
      const nomeProjeto = DOM.nomeProjeto.value.trim();
      const descricao = DOM.descricao.value.trim();

      if (DOM.form && !DOM.form.checkValidity()) {
        DOM.form.reportValidity();
        console.warn(
          "Utils.validarFormulario: Formulário inválido (HTML5 validation)."
        );
        return false;
      }

      if (nomeProjeto.length < 3) {
        Utils.exibirMensagem(
          DOM.mensagem,
          MESSAGES.errors.nameTooShort,
          "erro"
        );
        if (DOM.nomeProjeto) DOM.nomeProjeto.focus();
        console.warn("Utils.validarFormulario: Nome do projeto muito curto.");
        return false;
      }

      const maxLengthDescricao = parseInt(
        DOM.descricao.getAttribute("maxlength")
      );
      if (
        descricao.length < 10 ||
        (maxLengthDescricao && descricao.length > maxLengthDescricao)
      ) {
        Utils.exibirMensagem(
          DOM.mensagem,
          descricao.length < 10
            ? MESSAGES.errors.descriptionTooShort
            : `A descrição excede o limite de ${maxLengthDescricao} caracteres.`,
          "erro"
        );
        if (DOM.descricao) DOM.descricao.focus();
        console.warn("Utils.validarFormulario: Descrição inválida.");
        return false;
      }
      return true;
    },

    lerArquivo: (arquivo) => {
      return new Promise((resolve, reject) => {
        const tiposPermitidos = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
        ];

        if (!arquivo) {
          console.error("Utils.lerArquivo: Nenhum arquivo fornecido.");
          return reject("Nenhum arquivo selecionado para upload.");
        }

        if (!tiposPermitidos.includes(arquivo.type)) {
          console.error(
            "Utils.lerArquivo: Tipo de imagem inválido:",
            arquivo.type
          );
          return reject(MESSAGES.errors.invalidImage);
        }

        const leitor = new FileReader();
        leitor.onload = () => {
          resolve({ url: leitor.result, nome: arquivo.name });
        };
        leitor.onerror = (error) => {
          console.error("Utils.lerArquivo: Erro ao ler arquivo:", error);
          reject(MESSAGES.errors.invalidImage);
        };
        leitor.readAsDataURL(arquivo);
      });
    },

    limparFormulario: () => {
      if (DOM.form) DOM.form.reset();
      if (DOM.imagemPrincipal)
        DOM.imagemPrincipal.src = "../assets/img/publicacao/imagem1.png";
      if (DOM.nomeImagem) DOM.nomeImagem.textContent = "image_projeto.png";
      if (DOM.inputUpload) DOM.inputUpload.value = "";
      console.log("Utils.limparFormulario: Formulário limpo.");
      Utils.atualizarContadorCaracteres();
    },

    toggleLoader: (isLoading) => {
      if (!DOM.btnPublicar || !DOM.btnPublicarText || !DOM.btnPublicarLoader) {
        console.warn(
          "Utils.toggleLoader: Elementos do botão publicar não encontrados. Loader desativado."
        );
        return;
      }

      if (isLoading) {
        DOM.btnPublicar.disabled = true;
        DOM.btnPublicar.classList.add("loading");
        DOM.btnPublicarText.style.display = "none";
        DOM.btnPublicarLoader.classList.remove("hidden");
      } else {
        DOM.btnPublicar.disabled = false;
        DOM.btnPublicar.classList.remove("loading");
        DOM.btnPublicarText.style.display = "block";
        DOM.btnPublicarLoader.classList.add("hidden");
      }
    },

    atualizarContadorCaracteres: () => {
      if (!DOM.descricao || !DOM.contadorCaracteres) {
        console.warn(
          "Utils.atualizarContadorCaracteres: Elementos de texto ou contador não encontrados."
        );
        return;
      }

      const comprimentoAtual = DOM.descricao.value.length;
      const maxLength = parseInt(DOM.descricao.getAttribute("maxlength"));

      if (isNaN(maxLength)) {
        DOM.contadorCaracteres.textContent = `${comprimentoAtual}`;
        DOM.contadorCaracteres.classList.remove("aviso", "limite-atingido");
        return;
      }

      const restantes = maxLength - comprimentoAtual;

      DOM.contadorCaracteres.textContent = `${comprimentoAtual}/${maxLength}`;

      DOM.contadorCaracteres.classList.remove("aviso", "limite-atingido");

      if (restantes <= 20 && restantes > 0) {
        DOM.contadorCaracteres.classList.add("aviso");
      } else if (restantes <= 0) {
        DOM.contadorCaracteres.classList.add("limite-atingido");
      }
    },
  };

  async function uploadCloudinary(file) {
    if (!file) {
      console.warn("uploadCloudinary: Nenhum arquivo para upload.");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CONFIG.CLOUDINARY.UPLOAD_PRESET);
    try {
      const response = await fetch(CONFIG.CLOUDINARY.UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        console.log(
          "uploadCloudinary: Upload bem-sucedido. URL:",
          data.secure_url
        );
        return data.secure_url;
      } else {
        console.error(
          "uploadCloudinary: secure_url não encontrada na resposta do Cloudinary.",
          data
        );
        throw new Error(MESSAGES.errors.uploadFailed);
      }
    } catch (error) {
      console.error("uploadCloudinary: Erro no upload para Cloudinary:", error);
      throw new Error(MESSAGES.errors.uploadFailed);
    }
  }

  const Handlers = {
    handleUpload: async (event) => {
      const arquivo = event.target.files[0];
      console.log("Handlers.handleUpload: Arquivo selecionado:", arquivo);
      if (!arquivo) {
        if (DOM.imagemPrincipal)
          DOM.imagemPrincipal.src = "../assets/img/publicacao/imagem1.png";
        if (DOM.nomeImagem) DOM.nomeImagem.textContent = "image_projeto.png";
        console.log(
          "Handlers.handleUpload: Nenhuma imagem selecionada ou seleção cancelada."
        );
        return;
      }
      try {
        const conteudo = await Utils.lerArquivo(arquivo);
        if (DOM.imagemPrincipal) DOM.imagemPrincipal.src = conteudo.url;
        if (DOM.nomeImagem) DOM.nomeImagem.textContent = conteudo.nome;
        console.log("Handlers.handleUpload: Imagem preview atualizada.");
      } catch (erro) {
        Utils.exibirMensagem(DOM.mensagem, erro, "erro");
        if (DOM.imagemPrincipal)
          DOM.imagemPrincipal.src = "../assets/img/publicacao/imagem1.png";
        if (DOM.nomeImagem) DOM.nomeImagem.textContent = "image_projeto.png";
        if (DOM.inputUpload) DOM.inputUpload.value = "";
      }
    },

    handleDescartar: () => {
      Utils.limparFormulario();
      Utils.exibirMensagem(DOM.mensagem, "Formulário descartado.", "sucesso");
      console.log("Handlers.handleDescartar: Botão Descartar clicado.");
    },

    ajustarTextarea: () => {
      if (DOM.descricao) {
        DOM.descricao.addEventListener("input", function () {
          this.style.height = "auto";
          this.style.height = this.scrollHeight + "px";
          Utils.atualizarContadorCaracteres();
        });
        console.log(
          "Handlers.ajustarTextarea: Listener de ajuste de textarea adicionado."
        );
      } else {
        console.warn(
          "Handlers.ajustarTextarea: Elemento 'descricao' não encontrado para ajuste."
        );
      }
    },

    handleSubmit: async (event) => {
      event.preventDefault();
      const startTime = Date.now();

      Utils.toggleLoader(true);

      console.log("Handlers.handleSubmit: Início da submissão do formulário.");

      try {
        if (!Utils.validarFormulario()) {
          console.warn(
            "Handlers.handleSubmit: Validação do formulário falhou. Abortando submissão."
          );
          return;
        }

        let imageUrl = null;
        const imageFile = DOM.inputUpload.files[0];
        console.log(
          "Handlers.handleSubmit: Arquivo de imagem selecionado:",
          imageFile
        );

        if (imageFile) {
          console.log(
            "Handlers.handleSubmit: Iniciando upload de imagem para Cloudinary..."
          );
          imageUrl = await uploadCloudinary(imageFile);
          if (!imageUrl) {
            Utils.exibirMensagem(
              DOM.mensagem,
              MESSAGES.errors.uploadFailed,
              "erro"
            );
            console.error(
              "Handlers.handleSubmit: Falha no upload da imagem para Cloudinary."
            );
            return;
          }
          console.log(
            "Handlers.handleSubmit: Imagem URL do Cloudinary:",
            imageUrl
          );
        } else {
          console.log(
            "Handlers.handleSubmit: Nenhuma imagem selecionada para upload."
          );
        }

        const dadosParaEnvio = {
          title: DOM.nomeProjeto.value.trim(),
          descricao: DOM.descricao.value.trim(),
          usuarioId: userId ? parseInt(userId) : null,
          imageUrl: imageUrl || null,
        };

        const userName = localStorage.getItem("userName");
        if (userName) {
          dadosParaEnvio.nomeUsuario = userName;
          console.log(
            "Handlers.handleSubmit: Nome do usuário adicionado:",
            userName
          );
        } else {
          console.warn(
            "Handlers.handleSubmit: Nome do usuário 'userName' não encontrado no localStorage."
          );
        }

        console.log(
          "Handlers.handleSubmit: Dados finais a serem enviados para a API:",
          dadosParaEnvio
        );

        await API.criarPublicacao(dadosParaEnvio);

        Utils.exibirMensagem(
          DOM.mensagem,
          MESSAGES.success.postCreated,
          "sucesso"
        );
        console.log("Handlers.handleSubmit: Projeto publicado com sucesso!");

        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(
          CONFIG.MESSAGE_DISPLAY_TIME - elapsed,
          1000
        );

        setTimeout(() => {
          Utils.limparFormulario();
          console.log(
            "Handlers.handleSubmit: Redirecionando para a página de perfil..."
          );
          window.location.href = `${CONFIG.PERFIL_PAGE}?userId=${userId}`;
        }, remainingTime);
      } catch (error) {
        console.error(
          "Handlers.handleSubmit: Erro durante a submissão:",
          error
        );
        Utils.exibirMensagem(
          DOM.mensagem,
          error.message || MESSAGES.errors.serverError,
          "erro"
        );
      } finally {
        Utils.toggleLoader(false);
        console.log("Handlers.handleSubmit: Finalizando submissão.");
      }
    },
  };

  const init = () => {
    DOM.init();
    Handlers.ajustarTextarea();

    if (DOM.descricao && DOM.contadorCaracteres) {
      Utils.atualizarContadorCaracteres();
      DOM.descricao.addEventListener(
        "input",
        Utils.atualizarContadorCaracteres
      );
      console.log("init: Listener de contador de caracteres adicionado.");
    } else {
      console.warn(
        "init: Elementos de descrição ou contador não encontrados para o contador de caracteres."
      );
    }

    if (DOM.form) {
      DOM.form.addEventListener("submit", Handlers.handleSubmit);
    } else {
      console.warn("init: Formulário não encontrado. Submissão desativada.");
    }

    if (DOM.btnUpload && DOM.inputUpload) {
      DOM.btnUpload.addEventListener("click", () => DOM.inputUpload.click());
    } else {
      console.warn("init: Botão de upload ou input de imagem não encontrado.");
    }

    if (DOM.inputUpload) {
      DOM.inputUpload.addEventListener("change", Handlers.handleUpload);
    } else {
      console.warn(
        "init: Input de imagem não encontrado para listener de mudança."
      );
    }

    if (DOM.btnDescartar) {
      DOM.btnDescartar.addEventListener("click", Handlers.handleDescartar);
    } else {
      console.warn("init: Botão Descartar não encontrado.");
    }

    console.log("init: Event listeners configurados.");
  };

  init();
});
