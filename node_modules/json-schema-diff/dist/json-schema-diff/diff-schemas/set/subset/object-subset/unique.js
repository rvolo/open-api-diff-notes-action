"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.unique = (arr1, arr2) => _.sortBy(_.uniq(arr1.concat(arr2)));
