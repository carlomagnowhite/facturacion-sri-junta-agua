export type ThirdPartValue = {
  concepto: string;
  total: string;
};

export type OtherThirdPartValues = {
  rubro: ThirdPartValue[];
};

const value: ThirdPartValue = {
  concepto: "concepto0",
  total: "50.00",
};

export const otherThirdPartValues: OtherThirdPartValues = {
  rubro: [value, value],
};
