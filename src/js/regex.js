"use strict";

export const COMMENT = /^[\/]{2}(.*?)$/gm;
export const HEADING = /^(.*?):$/gm;
export const VARIABLE = /^\s*([\p{L}_]+) +(=) +([^=]+)$/gmu;
export const WORD = /[\p{L}_]+/gu;
export const SUFFIX = /(\d+(?:\.\d+)?)([KkMB]{1}\b)/g;
export const TAB = /\t/g;
