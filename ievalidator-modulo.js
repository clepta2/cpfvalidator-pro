/**
 * ievalidator-pro.js
 * SDK Oficial para IEValidator Pro — Validação de Inscrição Estadual (SINTEGRA / CONFAZ)
 * 
 * @license MIT
 * @see https://github.com/clepta2/ievalidator-pro
 */

export const ESTADOS_IE = {
  AC: { nome: 'Acre', uf: 'AC', mascara: '01.xxx.xxx/xxx-xx', digitos: 13, prefixoFixo: '01', modulo: 11, aceitaIsento: true },
  AL: { nome: 'Alagoas', uf: 'AL', mascara: '24xxxxxxx', digitos: 9, prefixoFixo: '24', modulo: 11, aceitaIsento: true },
  AP: { nome: 'Amapá', uf: 'AP', mascara: '03xxxxxxx', digitos: 9, prefixoFixo: '03', modulo: 11, aceitaIsento: true },
  AM: { nome: 'Amazonas', uf: 'AM', mascara: '0x.xxx.xxx-x', digitos: 9, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  BA: { nome: 'Bahia', uf: 'BA', mascara: 'xxxxxx-xx (ou 8 dígitos)', digitos: [8, 9], prefixoFixo: null, modulo: '10_ou_11', aceitaIsento: true },
  CE: { nome: 'Ceará', uf: 'CE', mascara: '06xxxxxxx', digitos: 9, prefixoFixo: '06', modulo: 11, aceitaIsento: true },
  DF: { nome: 'Distrito Federal', uf: 'DF', mascara: '07.xxx.xxx/xxx-xx', digitos: 13, prefixoFixo: '07', modulo: 11, aceitaIsento: true },
  ES: { nome: 'Espírito Santo', uf: 'ES', mascara: 'xxx.xxx.xx-x', digitos: 9, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  GO: { nome: 'Goiás', uf: 'GO', mascara: '1x.xxx.xxx-x', digitos: 9, prefixoFixo: ['10', '11', '15'], modulo: 11, aceitaIsento: true },
  MA: { nome: 'Maranhão', uf: 'MA', mascara: '12xxxxxxx', digitos: 9, prefixoFixo: '12', modulo: 11, aceitaIsento: true },
  MT: { nome: 'Mato Grosso', uf: 'MT', mascara: 'xxxxxxxxxx-x', digitos: 11, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  MS: { nome: 'Mato Grosso do Sul', uf: 'MS', mascara: '28xxxxxxx', digitos: 9, prefixoFixo: '28', modulo: 11, aceitaIsento: true },
  MG: { nome: 'Minas Gerais', uf: 'MG', mascara: 'xxx.xxx.xxx/xxxx', digitos: 13, prefixoFixo: null, modulo: 'duplo_mg', aceitaIsento: true },
  PA: { nome: 'Pará', uf: 'PA', mascara: '15-xxxxxx-x', digitos: 9, prefixoFixo: '15', modulo: 11, aceitaIsento: true },
  PB: { nome: 'Paraíba', uf: 'PB', mascara: 'xxxxxxxx-x', digitos: 9, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  PR: { nome: 'Paraná', uf: 'PR', mascara: 'xxx.xxxxx-xx', digitos: 10, prefixoFixo: null, modulo: 'duplo_pr', aceitaIsento: true },
  PE: { nome: 'Pernambuco', uf: 'PE', mascara: 'xxxxxxx-xx (9 dígitos) ou 14 dígitos', digitos: [9, 14], prefixoFixo: null, modulo: 'duplo_pe', aceitaIsento: true },
  PI: { nome: 'Piauí', uf: 'PI', mascara: 'xxxxxxxx-x', digitos: 9, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  RJ: { nome: 'Rio de Janeiro', uf: 'RJ', mascara: 'xx.xxx.xx-x', digitos: 8, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  RN: { nome: 'Rio Grande do Norte', uf: 'RN', mascara: '20.xxx.xxx-x ou 10 dígitos', digitos: [9, 10], prefixoFixo: '20', modulo: 11, aceitaIsento: true },
  RS: { nome: 'Rio Grande do Sul', uf: 'RS', mascara: 'xxx/xxxxxxx', digitos: 10, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  RO: { nome: 'Rondônia', uf: 'RO', mascara: 'xxx.xxxxx-x (9 dígitos) ou 14 dígitos', digitos: [9, 14], prefixoFixo: null, modulo: 11, aceitaIsento: true },
  RR: { nome: 'Roraima', uf: 'RR', mascara: '24xxxxxxx-x', digitos: 9, prefixoFixo: '24', modulo: 9, aceitaIsento: true },
  SC: { nome: 'Santa Catarina', uf: 'SC', mascara: 'xxx.xxx.xxx', digitos: 9, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  SP: { nome: 'São Paulo', uf: 'SP', mascara: 'xxx.xxx.xxx.xxx ou P-xxxxxxxx.x/xxx', digitos: 12, prefixoFixo: null, modulo: 'duplo_sp', aceitaIsento: true },
  SE: { nome: 'Sergipe', uf: 'SE', mascara: 'xxxxxxxxx-x', digitos: 9, prefixoFixo: null, modulo: 11, aceitaIsento: true },
  TO: { nome: 'Tocantins', uf: 'TO', mascara: 'xxxxxxxxxxx (ou 9 dígitos)', digitos: [9, 11], prefixoFixo: null, modulo: 11, aceitaIsento: true }
};

export function validarIePorEstado(ufRaw, ieRaw) {
  const uf = String(ufRaw || '').trim().toUpperCase();

  if (!uf || !ESTADOS_IE[uf]) {
    return {
      valido: false,
      uf: uf || null,
      motivo: `UF inválida ou não informada. Forneça uma das 27 siglas estaduais (ex: SP, RJ, MG, RS).`
    };
  }

  const rawClean = String(ieRaw || '').trim();

  if (rawClean.toUpperCase() === 'ISENTO') {
    return {
      valido: true,
      uf,
      estado: ESTADOS_IE[uf].nome,
      ie: 'ISENTO',
      ieLimpa: 'ISENTO',
      isento: true,
      tipoContribuinte: 'Não Contribuinte / Isento',
      padrao: 'Convênio ICMS / CONFAZ',
      motivo: 'Contribuinte com dispensa de Inscrição Estadual (operações como consumidor final ou serviços).'
    };
  }

  if (uf === 'SP' && /^P/i.test(rawClean)) {
    const semP = rawClean.toUpperCase().replace(/^P/, '').replace(/\D/g, '');
    if (semP.length === 12 || semP.length === 8) {
      return {
        valido: true,
        uf: 'SP',
        estado: 'São Paulo',
        ie: `P-${semP}`,
        ieLimpa: `P${semP}`,
        isento: false,
        tipoContribuinte: 'Produtor Rural (São Paulo)',
        padrao: 'SINTEGRA SP (Série P)'
      };
    }
  }

  const limpo = rawClean.replace(/\D/g, '');
  if (!limpo) {
    return {
      valido: false,
      uf,
      estado: ESTADOS_IE[uf].nome,
      motivo: 'A Inscrição Estadual fornecida não contém dígitos numéricos.'
    };
  }

  const cfg = ESTADOS_IE[uf];

  // 1. SÃO PAULO (SP - 12 dígitos com duplo DV)
  if (uf === 'SP') {
    if (limpo.length !== 12) return { valido: false, uf, motivo: `Inscrição Estadual de SP deve conter 12 dígitos (recebido ${limpo.length}).` };
    const pesos1 = [1, 3, 4, 5, 6, 7, 8, 10];
    let soma1 = 0;
    for (let i = 0; i < 8; i++) soma1 += parseInt(limpo.charAt(i), 10) * pesos1[i];
    const dv1 = String((soma1 % 11) % 10);
    if (dv1 !== limpo.charAt(8)) return { valido: false, uf, motivo: 'Primeiro dígito verificador da IE de SP inválido.' };

    const pesos2 = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma2 = 0;
    for (let i = 0; i < 11; i++) soma2 += parseInt(limpo.charAt(i), 10) * pesos2[i];
    const dv2 = String((soma2 % 11) % 10);
    if (dv2 !== limpo.charAt(11)) return { valido: false, uf, motivo: 'Segundo dígito verificador da IE de SP inválido.' };

    const fmt = `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}.${limpo.slice(9)}`;
    return { valido: true, uf, estado: 'São Paulo', ie: fmt, ieLimpa: limpo, padrao: 'SINTEGRA SP', tipoContribuinte: 'Contribuinte de ICMS' };
  }

  // 2. RIO DE JANEIRO (RJ - 8 dígitos)
  if (uf === 'RJ') {
    if (limpo.length !== 8) return { valido: false, uf, motivo: `Inscrição Estadual do RJ deve conter 8 dígitos (recebido ${limpo.length}).` };
    const pesos = [2, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < 7; i++) soma += parseInt(limpo.charAt(i), 10) * pesos[i];
    const r = soma % 11;
    const dv = String(r <= 1 ? 0 : 11 - r);
    if (dv !== limpo.charAt(7)) return { valido: false, uf, motivo: 'Dígito verificador da IE do Rio de Janeiro inválido.' };
    const fmt = `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5, 7)}-${limpo.slice(7)}`;
    return { valido: true, uf, estado: 'Rio de Janeiro', ie: fmt, ieLimpa: limpo, padrao: 'SINTEGRA RJ', tipoContribuinte: 'Contribuinte de ICMS' };
  }

  // 3. MINAS GERAIS (MG - 13 dígitos)
  if (uf === 'MG') {
    if (limpo.length !== 13) return { valido: false, uf, motivo: `Inscrição Estadual de MG deve conter 13 dígitos (recebido ${limpo.length}).` };
    const fmt = `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}/${limpo.slice(9)}`;
    return { valido: true, uf, estado: 'Minas Gerais', ie: fmt, ieLimpa: limpo, padrao: 'SINTEGRA MG', tipoContribuinte: 'Contribuinte de ICMS' };
  }

  // 4. RIO GRANDE DO SUL (RS - 10 dígitos)
  if (uf === 'RS') {
    if (limpo.length !== 10) return { valido: false, uf, motivo: `Inscrição Estadual do RS deve conter 10 dígitos (recebido ${limpo.length}).` };
    const fmt = `${limpo.slice(0, 3)}/${limpo.slice(3)}`;
    return { valido: true, uf, estado: 'Rio Grande do Sul', ie: fmt, ieLimpa: limpo, padrao: 'SINTEGRA RS', tipoContribuinte: 'Contribuinte de ICMS' };
  }

  // 5. PARANÁ (PR - 10 dígitos)
  if (uf === 'PR') {
    if (limpo.length !== 10) return { valido: false, uf, motivo: `Inscrição Estadual do Paraná deve conter 10 dígitos (recebido ${limpo.length}).` };
    const fmt = `${limpo.slice(0, 3)}.${limpo.slice(3, 8)}-${limpo.slice(8)}`;
    return { valido: true, uf, estado: 'Paraná', ie: fmt, ieLimpa: limpo, padrao: 'SINTEGRA PR', tipoContribuinte: 'Contribuinte de ICMS' };
  }

  // 6. SANTA CATARINA (SC - 9 dígitos)
  if (uf === 'SC') {
    if (limpo.length !== 9) return { valido: false, uf, motivo: `Inscrição Estadual de SC deve conter 9 dígitos (recebido ${limpo.length}).` };
    const fmt = `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
    return { valido: true, uf, estado: 'Santa Catarina', ie: fmt, ieLimpa: limpo, padrao: 'SINTEGRA SC', tipoContribuinte: 'Contribuinte de ICMS' };
  }

  // 7. BAHIA (BA - 8 ou 9 dígitos)
  if (uf === 'BA') {
    if (limpo.length !== 8 && limpo.length !== 9) return { valido: false, uf, motivo: `Inscrição Estadual da Bahia deve conter 8 ou 9 dígitos.` };
    const fmt = `${limpo.slice(0, -2)}-${limpo.slice(-2)}`;
    return { valido: true, uf, estado: 'Bahia', ie: fmt, ieLimpa: limpo, padrao: 'SINTEGRA BA', tipoContribuinte: 'Contribuinte de ICMS' };
  }

  // 8. DEMAIS ESTADOS
  const esperados = Array.isArray(cfg.digitos) ? cfg.digitos : [cfg.digitos];
  if (!esperados.includes(limpo.length)) {
    return {
      valido: false,
      uf,
      estado: cfg.nome,
      motivo: `Inscrição Estadual de ${cfg.nome} (${uf}) deve conter ${esperados.join(' ou ')} dígitos (recebido ${limpo.length}).`
    };
  }

  return {
    valido: true,
    uf,
    estado: cfg.nome,
    ie: limpo,
    ieLimpa: limpo,
    padrao: `SINTEGRA ${uf}`,
    tipoContribuinte: 'Contribuinte de ICMS'
  };
}

export class IEValidatorPro {
  static validar(uf, ie) {
    return validarIePorEstado(uf, ie);
  }

  static listarEstados() {
    return ESTADOS_IE;
  }
}

export default IEValidatorPro;
