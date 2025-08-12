declare module 'react-select-country-list' {
  interface CountryOption {
    value: string;
    label: string;
  }

  interface CountryList {
    getData(): CountryOption[];
    getLabel(value: string): string;
    getValue(label: string): string;
  }

  function countryList(): CountryList;
  export = countryList;
}
