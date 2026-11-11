# 🛡️ CpfValidator Pro — SDK & API de Validação e Sanitização de CPF

> **API REST e SDK de alta performance em Cloudflare Edge para validação algorítmica (Módulo 11), sanitização e dedução de Regiões Fiscais da Receita Federal (<5ms de latência).**

[![Status](https://img.shields.io/badge/Status-Cloudflare%20Edge%20API-success.svg)](#)
[![Algoritmo](https://img.shields.io/badge/Algoritmo-Módulo%2011%20Oficial-blue.svg)](#)
[![Latency](https://img.shields.io/badge/Latência-<5ms-cyan.svg)](#)
[![License](https://img.shields.io/badge/License-MIT%20SDK-purple.svg)](LICENSE)

---

## ⚡ O que é o CpfValidator Pro?

O **CpfValidator Pro** é uma solução leve e ultrarrápida da OZPro Enterprise desenvolvida para eliminar entradas inválidas de CPF em:
- **Sistemas de Checkout & E-commerce**
- **Plataformas de Onboarding & KYC**
- **ERPs e Faturamento Fiscal (NFC-e / NF-e)**
- **Bots de Atendimento WhatsApp**

A validação pode ser executada **100% localmente no cliente (0ms I/O)** ou através da **API Anycast global da Cloudflare**.

---

## 🚀 Como Integrar em seu Projeto

### 1. Instalação

```bash
npm install cpfvalidator-pro
```

*(Ou utilize o arquivo `cpfvalidator-pro.js` diretamente no seu frontend ou backend Node.js)*.

### 2. Uso Rápido com o SDK (Local em RAM - 0ms)

```javascript
import { CpfValidatorPro } from 'cpfvalidator-pro';

// Validação matemática instantânea sem chamada de rede
const resultado = CpfValidatorPro.validarLocal('529.982.247-25');

console.log(resultado.valido); // true
console.log(resultado.regiaoFiscal.estados); // ['ES', 'RJ']
console.log(resultado.cpf); // '529.982.247-25'
```

### 3. Chamada via Edge API Cloudflare

```javascript
const api = new CpfValidatorPro();
const res = await api.validar('52998224725');
console.log(res);
```

### 4. Exemplos de Chamadas HTTP Diretas (Curl / Fetch)

```bash
# Endpoint Oficial Cloudflare Workers (Cota de 100k req/dia)
curl -X GET "https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=529.982.247-25"

# Gerador de CPF Válido para Testes
curl -X GET "https://cpfvalidator-pro-api.maputo2.workers.dev/api/gerar"

# Via Path Parameter
curl -X GET "https://cpfvalidator-pro-api.maputo2.workers.dev/api/cpf/52998224725"

# Via POST JSON
curl -X POST "https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf" \
  -H "Content-Type: application/json" \
  -d '{"cpf": "111.111.111-11"}'
```

---

## 💻 Como Consultar a API em Qualquer Linguagem de Programação

### 🐍 Python
```python
import requests

res = requests.get(
    "https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf",
    params={"cpf": "529.982.247-25"}
).json()

print("Válido?", res["valido"])
print("Região:", res["regiaoFiscal"]["descricao"])
```

### 🐘 PHP (Laravel, WordPress, WooCommerce)
```php
<?php
$res = json_decode(file_get_contents("https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=529.982.247-25"), true);
echo $res['valido'] ? "CPF Válido" : "Inválido";
?>
```

### 🔷 C# / .NET
```csharp
using var client = new HttpClient();
string json = await client.GetStringAsync("https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=529.982.247-25");
Console.WriteLine(json);
```

### 🌐 JavaScript / TypeScript
```javascript
const res = await fetch("https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=529.982.247-25");
const dados = await res.json();
console.log(dados.valido, dados.regiaoFiscal.estados);
```

---

## 📋 Tabela de Regiões Fiscais Deductíveis

Pelo 9º dígito do CPF, a API deduz a jurisdição de registro de emissão da Receita Federal:

| 9º Dígito | Estados (UF) | Região Fiscal |
| :---: | :--- | :--- |
| **1** | DF, GO, MS, MT, TO | 1ª Região Fiscal |
| **2** | AC, AM, AP, PA, RO, RR | 2ª Região Fiscal |
| **3** | CE, MA, PI | 3ª Região Fiscal |
| **4** | AL, PB, PE, RN | 4ª Região Fiscal |
| **5** | BA, SE | 5ª Região Fiscal |
| **6** | MG | 6ª Região Fiscal |
| **7** | ES, RJ | 7ª Região Fiscal |
| **8** | SP | 8ª Região Fiscal |
| **9** | PR, SC | 9ª Região Fiscal |
| **0** | RS | 10ª Região Fiscal |

---

## 💡 Casos de Uso Recomendados (Exemplos Práticos de Integração)

### 1. Validação Pré-Checkout em Formulários de Pagamento (PIX & Cartão)
Evite que gateways de pagamento (Asaas, Mercado Pago, Stripe, Pagar.me) recusem cobranças com erros genéricos. Valide o CPF no frontend antes de disparar a requisição de pagamento:

```javascript
import { CpfValidatorPro } from 'cpfvalidator-pro';

const inputCpf = document.querySelector('#cpfCliente').value;
const resultado = CpfValidatorPro.validarLocal(inputCpf);

if (!resultado.valido) {
  alert('Atenção: ' + resultado.motivo);
  return; // Impede submissão de cobrança com documento inválido
}
```

### 2. Feedback Visual Inteligente no Cadastro (Exibição de UF de Origem)
Exiba para o atendente ou cliente o Estado de registro do documento em tempo real sem chamadas externas de rede:

```javascript
import { CpfValidatorPro } from 'cpfvalidator-pro';

document.querySelector('#cpfInput').addEventListener('input', (e) => {
  const res = CpfValidatorPro.validarLocal(e.target.value);
  const msgEl = document.querySelector('#feedbackDoc');

  if (res.valido) {
    msgEl.innerHTML = `✅ CPF Válido (Origem: ${res.regiaoFiscal.descricao})`;
    msgEl.style.color = '#10b981';
  } else if (e.target.value.replace(/\D/g, '').length === 11) {
    msgEl.innerHTML = `❌ ${res.motivo}`;
    msgEl.style.color = '#ef4444';
  }
});
```

### 3. Frente de Caixa & PDV Offline (Alta Resiliência)
Em caso de oscilação de internet no ponto de venda, a rotina `validarLocal` garante a conformidade dos dados para contingência da NFC-e/SAT sem travar o operador de caixa.

---

## 🔗 Como Usar em Conjunto com as Outras APIs da Ponte

### 🏢 Onboarding Completo PF / PJ (CPF + CNPJ Pro)
Em formulários de cadastro de clientes, utilize o `CpfValidatorPro` para Pessoa Física e encadeie com a `CnpjPro` para Pessoa Jurídica:

```javascript
import { CpfValidatorPro } from 'cpfvalidator-pro';
import CnpjPro from 'cnpj-pro';

async function validarDocumentoCliente(doc) {
  const limpo = doc.replace(/\D/g, '');

  if (limpo.length === 11) {
    // 1. Validação Matemática Instantânea de CPF (0ms I/O)
    const cpf = CpfValidatorPro.validarLocal(limpo);
    return { tipo: 'PF', valido: cpf.valido, formatado: cpf.cpf, ufOrigem: cpf.regiaoFiscal?.estados };
  } 
  
  if (limpo.length === 14) {
    // 2. Consulta Cadastral Completa de CNPJ na Borda (<25ms)
    const cnpjApi = new CnpjPro();
    const empresa = await cnpjApi.consultar(limpo);
    return {
      tipo: 'PJ',
      valido: empresa.situacaoCadastral === 'ATIVA',
      razaoSocial: empresa.razaoSocial,
      cnae: empresa.cnaePrincipalDescricao
    };
  }

  throw new Error('Documento com tamanho inválido.');
}
```
