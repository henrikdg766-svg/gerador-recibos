/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function capitalizarNome(nome) {
  const minusculas = ['de', 'da', 'do', 'dos', 'das', 'e', 'di', 'du'];
  return nome
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, index) => {
      if (palavra.length === 0) return '';
      if (index === 0) return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      if (minusculas.includes(palavra)) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}

/* =========================================================
   MÁSCARA CPF / CNPJ
   ========================================================= */

function getTipoDoc() {
  const radios = document.getElementsByName('tipoDoc');
  for (const r of radios) if (r.checked) return r.value;
  return 'cpf';
}

function trocarTipoDoc() {
  const tipo  = getTipoDoc();
  const input = document.getElementById('documento');
  const label = document.getElementById('labelDocumento');
  input.value = '';

  if (tipo === 'cpf') {
    label.textContent = 'CPF do Cliente';
    input.placeholder = '000.000.000-00';
    input.maxLength   = 14;
  } else {
    label.textContent = 'CNPJ do Cliente';
    input.placeholder = '00.000.000/0000-00';
    input.maxLength   = 18;
  }
  input.focus();
}

function mascararDocumento(input) {
  const tipo = getTipoDoc();
  let v = input.value.replace(/\D/g, '');

  if (tipo === 'cpf') {
    v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/,       '$1.$2');
    v = v.replace(/(\d{3})(\d)/,       '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    v = v.substring(0, 14);
    v = v.replace(/^(\d{2})(\d)/,          '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/,         '.$1/$2');
    v = v.replace(/(\d{4})(\d)/,           '$1-$2');
  }
  input.value = v;
}

/* =========================================================
   GERAR CARD
   ========================================================= */

function gerar() {
  const clienteOriginal = document.getElementById('cliente').value.trim();
  const tipoDoc         = getTipoDoc();
  const documento       = document.getElementById('documento').value.trim();
  const valor           = parseFloat(document.getElementById('valor').value) || 0;
  const desc1Raw        = document.getElementById('desc1').value.trim();
  const desc2Raw        = document.getElementById('desc2').value.trim();
  const mostrarLoja1    = document.getElementById('mostrarLoja1').checked;
  const mostrarLoja2    = document.getElementById('mostrarLoja2').checked;

  if (!clienteOriginal || valor <= 0) {
    alert('Preencha pelo menos: Nome do cliente e Valor do crédito.');
    return;
  }

  const cliente = capitalizarNome(clienteOriginal);

  const valorFormatado = valor.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  });

  const rotuloDoc = (tipoDoc === 'cpf') ? 'CPF' : 'CNPJ';
  const docTexto  = documento ? `${rotuloDoc}: ${documento}` : `${rotuloDoc}: —`;

  // Título
  document.getElementById('c-cliente').textContent   = cliente;
  document.getElementById('c-cliente2').textContent  = cliente;
  document.getElementById('c-documento').textContent = docTexto;
  document.getElementById('c-valor').textContent     = valorFormatado;

  // Assinatura cliente
  document.getElementById('c-ass-cliente-nome').textContent = cliente;
  document.getElementById('c-ass-cliente-doc').textContent  = docTexto;

  // Lojas — exibição + desconto condicional
  const loja1El = document.getElementById('c-loja1');
  const loja2El = document.getElementById('c-loja2');

  if (mostrarLoja1) {
    loja1El.style.display = 'flex';
    aplicarDesconto('c-loja1-desconto', 'c-loja1-desc', desc1Raw);
  } else {
    loja1El.style.display = 'none';
  }

  if (mostrarLoja2) {
    loja2El.style.display = 'flex';
    aplicarDesconto('c-loja2-desconto', 'c-loja2-desc', desc2Raw);
  } else {
    loja2El.style.display = 'none';
  }

  // Título das lojas
  const tituloLojas = document.getElementById('c-lojas-titulo');
  tituloLojas.style.display = (!mostrarLoja1 && !mostrarLoja2) ? 'none' : 'block';

  // Local e Data
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  document.getElementById('c-local-data').textContent =
    `Cascavel – PR, ${dia}/${mes}/${ano}`;

  // Troca de tela
  document.getElementById('formulario').style.display = 'none';
  document.getElementById('card').style.display       = 'block';
  window.scrollTo(0, 0);
}

/* Mostra o desconto se > 0, senão esconde a linha */
function aplicarDesconto(idBloco, idValor, valorRaw) {
  const bloco = document.getElementById(idBloco);
  const span  = document.getElementById(idValor);
  const numero = parseFloat(valorRaw);

  if (valorRaw === '' || isNaN(numero) || numero <= 0) {
    bloco.style.display = 'none';
  } else {
    bloco.style.display = 'block';
    span.textContent = numero + '%';
  }
}

function voltar() {
  document.getElementById('card').style.display       = 'none';
  document.getElementById('formulario').style.display = 'block';
}