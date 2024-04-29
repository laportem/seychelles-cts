import { RcFile } from 'antd/lib/upload';
import { Buffer } from 'buffer';

export const addCommSep = (value: any) => {
  return (
    Number(value)
      // .toString()
      .toFixed(2)
      .replace('.00', '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
};

export const addCommSepRound = (value: any) => {
  return Number(value)
    .toFixed(2)
    .replace('.00', '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const isBase64 = (str: string) => {
  if (!str || str === '' || str.trim() === '') {
    return false;
  }
  try {
    const bs = Buffer.from(str, 'base64').toString('base64');
    return bs === str;
  } catch (err) {
    return false;
  }
};

export const addSpaces = (text: string) => {
  if (!text) {
    return text;
  }
  if (text === text.toUpperCase()) {
    return text;
  }
  return text.replace(/([A-Z])/g, ' $1').trim();
};

export const joinTwoArrays = (arrayOne: any[], arrayTwo: any[]) => {
  const joinedArray = [...arrayOne];
  arrayTwo.forEach((value) => {
    if (!joinedArray.includes(value)) {
      joinedArray.push(value);
    }
  });
  return joinedArray;
};

export const getFormTitle = (
  formType: 'Action' | 'Programme' | 'Project' | 'Activity' | 'Support',
  formMethod: 'create' | 'update' | 'view'
) => {
  if (formMethod === 'create') {
    return [`add${formType}Title`, `add${formType}Desc`];
  } else if (formMethod === 'update') {
    return [`edit${formType}Title`, `edit${formType}Desc`];
  } else {
    return [`view${formType}Title`, `view${formType}Desc`];
  }
};
