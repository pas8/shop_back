"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var mongodb_1 = require("mongodb");
var use_res_end_util_1 = require("./utils/use_res_end.util");
var URL = 'mongodb+srv://admin:admin@cluster0.lvg9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
var client = new mongodb_1.MongoClient(URL);
client.connect();
var db = client.db('shop');
var productsCollection = db.collection('products');
var server = http_1.default.createServer(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, product, limitedProducts;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log(';');
                if (!req)
                    res.end(null);
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                if (!(((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/products')) && ((_b = req === null || req === void 0 ? void 0 : req.url) === null || _b === void 0 ? void 0 : _b.includes('?id=')) && req.method === 'GET')) return [3 /*break*/, 2];
                id = (_c = req.url.split('?id=')) === null || _c === void 0 ? void 0 : _c[1];
                return [4 /*yield*/, productsCollection.findOne({
                        id: id,
                    })];
            case 1:
                product = (_d.sent());
                return [2 /*return*/, (0, use_res_end_util_1.use_res_end)(res, [200, { 'Content-Type': 'application/json' }], product)];
            case 2:
                if (!(req.url === '/products' && req.method === 'GET')) return [3 /*break*/, 4];
                return [4 /*yield*/, productsCollection.find({}).limit(20).toArray()];
            case 3:
                limitedProducts = _d.sent();
                return [2 /*return*/, (0, use_res_end_util_1.use_res_end)(res, [200, { 'Content-Type': 'application/json' }], limitedProducts)];
            case 4:
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end('PAGE NOT FOUND');
                return [2 /*return*/];
        }
    });
}); });
var PORT = process.env.PORT || 3030;
server.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('Server was started on ' + PORT + ' port');
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=index.js.map