export function RegisterUI() {
  const formTitle = document.getElementById("form-title");
  const registerButton = document.getElementById("registerButton");
  const loginButton = document.getElementById("loginButton");

  let isRegisterMode = false;

  registerButton.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;

    if (isRegisterMode) {
      formTitle.textContent = "Register";
      loginButton.textContent = "Create Account";
      registerButton.textContent = "Back to Login";
    } else {
      formTitle.textContent = "Login";
      loginButton.textContent = "Login";
      registerButton.textContent = "Register";
    }
  });

  return {
    isRegisterMode: () => isRegisterMode,
    setLoginMode: () => {
      isRegisterMode = false;
      formTitle.textContent = "Login";
      loginButton.textContent = "Login";
      registerButton.textContent = "Register";
    }
  };
}
