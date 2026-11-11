export interface RegiaoFiscal {
  codigo: number | null;
  estados: string[];
  descricao: string;
}

export interface ResultadoValidacao {
  valido: boolean;
  cpf?: string;
  cpfLimpo?: string;
  digitosVerificadores?: string;
  regiaoFiscal?: RegiaoFiscal;
  tipo?: string;
  algoritmo?: string;
  cpfInformado?: string;
  totalDigitos?: number;
  digitoVerificadorEsperado?: string;
  digitoVerificadorInformado?: string;
  motivo?: string;
}

export interface CpfValidatorOptions {
  endpoint?: string;
  apiKey?: string;
}

export declare class CpfValidatorPro {
  constructor(options?: CpfValidatorOptions);
  static limpar(cpf: string): string;
  static formatar(cpf: string): string;
  static validarLocal(cpf: string): ResultadoValidacao;
  static gerarTeste(ufCode?: number | null): string;
  validar(cpf: string): Promise<ResultadoValidacao>;
}

export default CpfValidatorPro;
