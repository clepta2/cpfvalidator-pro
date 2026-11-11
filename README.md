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
# Via Query Param
curl -X GET "https://cpfvalidator-pro-api.fichatecnica-api.workers.dev/api/validar-cpf?cpf=529.982.247-25"

# Via Path Parameter
curl -X GET "https://cpfvalidator-pro-api.fichatecnica-api.workers.dev/api/cpf/52998224725"

# Via POST JSON
curl -X POST "https://cpfvalidator-pro-api.fichatecnica-api.workers.dev/api/validar-cpf" \
  -H "Content-Type: application/json" \
  -d '{"cpf": "111.111.111-11"}'
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

## 🔒 Marketplace de APIs & Ecossistema

Este projeto faz parte do ecossistema de APIs de alta performance OZPro Enterprise:
👉 **[Acessar Ponte API Marketplace](https://ponte.ozpro.com.br)**
