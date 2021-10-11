"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.use_res_end = void 0;
var use_res_end = function (res, headerArguments, content) {
    res.writeHead.apply(res, headerArguments);
    res.end(JSON.stringify(content));
};
exports.use_res_end = use_res_end;
//# sourceMappingURL=use_res_end.util.js.map