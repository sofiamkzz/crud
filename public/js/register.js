// Verifica se há dados armazenados e preenche os campos
  window.addEventListener('load', function () {
    preencherCampos();
  });

// Adiciona um ouvinte de evento ao formulário
  document.getElementById('form').addEventListener('submit', function () {
    // Armazena os dados dos campos antes de enviar o formulário
    armazenarCampos();
});

  // Função para armazenar os dados dos campos no armazenamento local
function armazenarCampos() {
    var campos = document.querySelectorAll('input, select');
    campos.forEach(function (campo) {
      localStorage.setItem(campo.name, campo.value);
    });
}

  // Função para preencher os campos a partir do armazenamento local
function preencherCampos() {
    var campos = document.querySelectorAll('input, select');
    campos.forEach(function (campo) {
      var valorArmazenado = localStorage.getItem(campo.name);
      if (valorArmazenado !== null) {
        campo.value = valorArmazenado;
      }
  });
}