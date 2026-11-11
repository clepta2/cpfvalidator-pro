# 👤 CpfValidator Pro — SDK & Documentação de Integração

> **Cliente SDK e Documentação Oficial de Integração da API CpfValidator Pro.**  
> 🔒 **Atenção:** Este repositório destina-se exclusivamente à visualização de documentação técnica e integração do cliente SDK. O serviço de API em nuvem é operado através do nosso **Site de APIs (em breve)**. O acesso aos endpoints na borda requer obrigatoriamente uma **Chave de API (`x-api-key`)** ativa.

[![Status](https://img.shields.io/badge/Status-Cloudflare%20Edge%20API-success.svg)](#)
[![CI/CD Tests](https://github.com/clepta2/cpfvalidator-pro/actions/workflows/test.yml/badge.svg)](https://github.com/clepta2/cpfvalidator-pro/actions)
[![Algoritmo](https://img.shields.io/badge/Algoritmo-Módulo%2011%20Oficial-blue.svg)](#)
[![Autenticação](https://img.shields.io/badge/Autenticação-x--api--key%20Obrigatória-orange.svg)](#)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietária%20%2F%20Portal%20de%20APIs-red.svg)](LICENSE)

---

> 🔒 **Acesso Oficial & Chaves de API**:  
> O acesso em produção a este microsserviço é disponibilizado e monitorado exclusivamente através do nosso **Site de APIs (em breve no ar)**.  
> Para obter sua chave de acesso (`x-api-key`), contratar cotas de requisições e testar ao vivo, realize o cadastro em nossa plataforma de APIs.

---

## ⚡ O que é o CpfValidator Pro?

O **CpfValidator Pro** é uma solução de infraestrutura leve desenvolvida para eliminar entradas inválidas de CPF em:
- **Sistemas de Checkout & E-commerce**
- **Plataformas de Onboarding & KYC**
- **ERPs e Faturamento Fiscal (NFC-e / NF-e)**
- **Bots de Atendimento WhatsApp**

A validação pode ser executada **100% localmente no cliente em memória RAM (0ms I/O)** ou através da **API Oficial na nuvem**.

---

## 🚀 Como Integrar em seu Projeto

### 1. Instalação

```bash
npm install cpfvalidator-pro
```

*(Ou utilize o arquivo `cpfvalidator-pro.js` diretamente no navegador ou Node.js)*.

### 2. Uso Rápido com o SDK (Local em RAM - 0ms de Rede)

```javascript
import { CpfValidatorPro } from 'cpfvalidator-pro';

// 1. Validação Instantânea em RAM
const resultado = CpfValidatorPro.validarLocal('529.982.247-25');

console.log(resultado.valido); // true
console.log(resultado.regiaoFiscal.descricao); // 'Espírito Santo e Rio de Janeiro'
console.log(resultado.cpfLimpo); // '52998224725'

// 2. Bloqueio de Dígitos Repetidos Conhecidos
const fake = CpfValidatorPro.validarLocal('111.111.111-11');
console.log(fake.valido); // false
console.log(fake.motivo); // 'Dígitos idênticos repetidos são matematicamente inválidos'

// 3. Gerador de CPF Válido para Testes Automatizados
const novoCpf = CpfValidatorPro.gerarTeste(8); // 8 = São Paulo
console.log(novoCpf); // Ex: '118.353.508-28'
```

### 3. Chamada via Edge API Oficial (Requer x-api-key)

```javascript
const api = new CpfValidatorPro({
  apiKey: 'SUA_CHAVE_DO_PORTAL' // Obtenha no Site de APIs
});
const res = await api.validar('52998224725');
console.log(res);
```

### 4. Exemplos de Chamadas HTTP Diretas (Curl)

```bash
# Validação oficial (Requer x-api-key)
curl -X GET "https://cpfvalidator-pro-api.maputo2.workers.dev/api/validar-cpf?cpf=529.982.247-25" \
  -H "x-api-key: SUA_CHAVE_DO_PORTAL"
```

---

## 📄 Licença

Distribuído sob termos proprietários. Veja `LICENSE` para mais detalhes.

Copyright (c) 2026 clepta2
