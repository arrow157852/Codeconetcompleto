//comando pro json: json-server --watch db.json --port 3000

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const emailLogin = document.getElementById("email-login");
  const senhaLogin = document.getElementById("senha-login");
  const mensagemLogin = document.getElementById("mensagem-login");
  const toggleSenha = document.getElementById("toggle-senha");

  toggleSenha.addEventListener("click", () => {
    if (senhaLogin.type === "password") {
      senhaLogin.type = "text";
      toggleSenha.textContent = "🙈";
    } else {
      senhaLogin.type = "password";
      toggleSenha.textContent = "👁️";
    }
  });

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(password) {
    const temTamanhoMinimo = password.length >= 8 && password.length <= 20;
    const temMaiuscula = /[A-Z]/.test(password);
    const temEspecial = /[!@#$%^&*()_.]/.test(password);
    return temTamanhoMinimo && temMaiuscula && temEspecial;
  }

  async function enviarDadosDeLogin(email, password) {
    const url = "http://localhost:3000/login"; 

    const dados = { email, password };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados), 
        });

        if (!response.ok) {
            throw new Error("Erro ao realizar login.");
        }

        const respostaJson = await response.json(); 
        return respostaJson; 
    } catch (error) {
        throw new Error(error.message);
    }
}


  function exibirMensagemLogin(texto, cor) {
    mensagemLogin.textContent = texto;
    mensagemLogin.style.color = cor;
  }

  btnLogin.addEventListener("click", async (event) => {
    event.preventDefault();

    const emailDigitado = emailLogin.value.trim();
    const senhaDigitada = senhaLogin.value.trim();

    if (!emailDigitado || !senhaDigitada) {
      exibirMensagemLogin("Preencha todos os campos.", "red");
      return;
    }

    if (!validarEmail(emailDigitado)) {
      exibirMensagemLogin(
        "Email inválido. Certifique-se de incluir '@' e um domínio válido.",
        "red"
      );
      return;
    }

    if (!validarSenha(senhaDigitada)) {
      exibirMensagemLogin(
        "A senha deve ter entre 8 e 20 caracteres, uma letra maiúscula e um caractere especial.",
        "red"
      );
      return;
    }

    try {
      btnLogin.disabled = true;
      btnLogin.textContent = "Carregando...";

      const usuario = await enviarDadosDeLogin(emailDigitado);

      if (usuario.senha !== senhaDigitada) {
        throw new Error("Senha incorreta.");
      }

      exibirMensagemLogin("Login realizado com sucesso!", "green");

      setTimeout(() => {
        window.location.href = "../pages/feed.html";
      }, 1000);
    } catch (error) {
      console.error("Erro no login:", error);
      exibirMensagemLogin("Email ou senha incorretos.", "red");
    } finally {
      setTimeout(() => {
        btnLogin.disabled = false;
        btnLogin.textContent = "Login";
      }, 1000);
    }
  });


  emailLogin.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      senhaLogin.focus();
    }
  });

  senhaLogin.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      btnLogin.click();
    }
  });
});
