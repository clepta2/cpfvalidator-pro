/**
 * CpfValidatorPro — SDK Oficial (Universal ESM / CommonJS / Browser)
 * Validação instantânea de CPF na máquina ou via Cloudflare Edge API.
 * 
 * @license MIT
 * @see https://github.com/clepta2/cpfvalidator-pro
 */

const REGIOES_FISCAIS = {
  '0': { codigo: 0, estados: ['RS'], descricao: 'Rio Grande do Sul' },
  '1': { codigo: 1, estados: ['DF', 'GO', 'MS', 'MT', 'TO'], descricao: 'Distrito Federal, Goiás, Mato Grosso do Sul, Mato Grosso e Tocantins' },
  '2': { codigo: 2, estados: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR'], descricao: 'Acre, Amazonas, Amapá, Pará, Rondônia e Roraima' },
  '3': { codigo: 3, estados: ['CE', 'MA', 'PI'], descricao: 'Ceará, Maranhão e Piauí' },
  '4': { codigo: 4, estados: ['AL', 'PB', 'PE', 'RN'], descricao: 'Alagoas, Paraíba, Pernambuco e Rio Grande do Norte' },
  '5': { codigo: 5, estados: ['BA', 'SE'], descricao: 'Bahia e Sergipe' },
  '6': { codigo: 6, estados: ['MG'], descricao: 'Minas Gerais' },
  '7': { codigo: 7, estados: ['ES', 'RJ'], descricao: 'Espírito Santo e Rio de Janeiro' },
  '8': { codigo: 8, estados: ['SP'], descricao: 'São Paulo' },
  '9': { codigo: 9, estados: ['PR', 'SC'], descricao: 'Paraná e Santa Catarina' }
};

const BLACKLIST_REPETIDOS = new Set([
  '00000000000', '11111111111', '22222222222', '33333333333',
  '44444444444', '55555555555', '66666666666', '77777777777',
  '88888888888', '99999999999'
]);

export class CpfValidatorPro {
  /**
   * @param {Object} [options]
   * @param {string} [options.endpoint] - URL base da API Cloudflare Edge
   * @param {string} [options.apiKey] - Chave da API (se aplicável para cotas)
   */
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'https://app.ozpro.com.br';
    this.apiKey = options.apiKey || '';
  }

  /**
   * Remove formatação deixando apenas números
   * @param {string} cpf 
   * @returns {string}
   */
  static limpar(cpf) {
    if (!cpf) return '';
    return String(cpf).replace(/\D/g, '');
  }

  /**
   * Formata número puro no padrão canônico 000.000.000-00
   * @param {string} cpf 
   * @returns {string}
   */
  static formatar(cpf) {
    const limpo = CpfValidatorPro.limpar(cpf);
    if (limpo.length !== 11) return cpf;
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  }

  /**
   * Validação matemática pura e instantânea (0ms em RAM, sem rede)
   * @param {string} rawInput 
   * @returns {Object}
   */
  static validarLocal(rawInput) {
    if (rawInput === null || rawInput === undefined) {
      return { valido: false, motivo: 'CPF não informado' };
    }

    const rawStr = String(rawInput).trim();
    const limpo = rawStr.replace(/\D/g, '');

    if (!limpo) {
      return { valido: false, cpfInformado: rawStr, motivo: 'Não contém números' };
    }

    if (limpo.length !== 11) {
      return {
        valido: false,
        cpfInformado: rawStr,
        cpfLimpo: limpo,
        motivo: `Quantidade de dígitos inválida: esperado 11, recebido ${limpo.length}`
      };
    }

    if (BLACKLIST_REPETIDOS.has(limpo)) {
      return {
        valido: false,
        cpfInformado: rawStr,
        cpfLimpo: limpo,
        motivo: 'Dígitos idênticos repetidos são matematicamente inválidos'
      };
    }

    // DV 1
    let soma1 = 0;
    for (let i = 0; i < 9; i++) {
      soma1 += parseInt(limpo.charAt(i), 10) * (10 - i);
    }
    let resto1 = soma1 % 11;
    let digito1 = resto1 < 2 ? 0 : 11 - resto1;

    if (digito1 !== parseInt(limpo.charAt(9), 10)) {
      return {
        valido: false,
        cpfInformado: rawStr,
        cpfLimpo: limpo,
        digitoVerificadorEsperado: `${digito1}?`,
        motivo: 'Primeiro dígito verificador incorreto'
      };
    }

    // DV 2
    let soma2 = 0;
    for (let i = 0; i < 10; i++) {
      soma2 += parseInt(limpo.charAt(i), 10) * (11 - i);
    }
    let resto2 = soma2 % 11;
    let digito2 = resto2 < 2 ? 0 : 11 - resto2;

    if (digito2 !== parseInt(limpo.charAt(10), 10)) {
      return {
        valido: false,
        cpfInformado: rawStr,
        cpfLimpo: limpo,
        digitoVerificadorEsperado: `${digito1}${digito2}`,
        motivo: 'Segundo dígito verificador incorreto'
      };
    }

    const digitoOrigem = limpo.charAt(8);
    const regiao = REGIOES_FISCAIS[digitoOrigem] || { codigo: null, estados: [], descricao: 'Desconhecida' };

    return {
      valido: true,
      cpf: CpfValidatorPro.formatar(limpo),
      cpfLimpo: limpo,
      digitosVerificadores: `${digito1}${digito2}`,
      regiaoFiscal: regiao,
      tipo: 'Pessoa Física (Brasil)',
      algoritmo: 'Módulo 11 (RFC Receita Federal)'
    };
  }

  /**
   * Consulta a API de borda Anycast da Cloudflare (<5ms)
   * @param {string} cpf 
   * @returns {Promise<Object>}
   */
  async validar(cpf) {
    const limpo = CpfValidatorPro.limpar(cpf);
    const url = `${this.endpoint.replace(/\/$/, '')}/api/validar-cpf?cpf=${encodeURIComponent(limpo)}`;

    const headers = { 'Accept': 'application/json' };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

    const res = await fetch(url, { headers });
    return await res.json();
  }

  /**
   * Gera um CPF válido matematicamente para testes automatizados
   * @param {string|number} [ufCode] - Código da região fiscal (0 a 9)
   * @returns {string}
   */
  static gerarTeste(ufCode = null) {
    const noveDigitos = [];
    for (let i = 0; i < 8; i++) {
      noveDigitos.push(Math.floor(Math.random() * 10));
    }
    const regiao = (ufCode !== null && ufCode >= 0 && ufCode <= 9) ? Number(ufCode) : Math.floor(Math.random() * 10);
    noveDigitos.push(regiao);

    let soma1 = 0;
    for (let i = 0; i < 9; i++) soma1 += noveDigitos[i] * (10 - i);
    let r1 = soma1 % 11;
    let d1 = r1 < 2 ? 0 : 11 - r1;
    noveDigitos.push(d1);

    let soma2 = 0;
    for (let i = 0; i < 10; i++) soma2 += noveDigitos[i] * (11 - i);
    let r2 = soma2 % 11;
    let d2 = r2 < 2 ? 0 : 11 - r2;
    noveDigitos.push(d2);

    return CpfValidatorPro.formatar(noveDigitos.join(''));
  }
}

export default CpfValidatorPro;
