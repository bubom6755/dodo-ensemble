"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/send-push";
exports.ids = ["pages/api/send-push"];
exports.modules = {

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "web-push":
/*!***************************!*\
  !*** external "web-push" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("web-push");

/***/ }),

/***/ "(api)/./pages/api/send-push.js":
/*!********************************!*\
  !*** ./pages/api/send-push.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);\n\nconst VAPID_PUBLIC_KEY = \"BInzKFIkdJ5js3aBJbZfpJ-JT7Yyqoj0QNMHt8hQLCyRiGUhEu3Al4WbVROXfUaQ02zZeL6RO4UuaMP2lLYbiGA\"; // Remplace par ta clé publique\nconst VAPID_PRIVATE_KEY = \"rtfNQU4_zsaJVLRIpEtoCM6p9Jyvv_BtEwGtH0gRxcQ\"; // Remplace par ta clé privée\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(\"https://wnssjmxbhungdkxzhynu.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induc3NqbXhiaHVuZ2RreHpoeW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDA5NDYsImV4cCI6MjA2ODY3Njk0Nn0.ClhHwh9DKKH1wMLFAgf-aSGrgBOn17LUt46viMTIfO8\");\nasync function handler(req, res) {\n    // Import dynamique de web-push pour éviter l'erreur de build Next.js\n    const webpush = (await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! web-push */ \"web-push\", 23))).default;\n    webpush.setVapidDetails(\"mailto:victor.wambersie@gmail.com\", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);\n    if (req.method !== \"POST\") return res.status(405).end();\n    const { userId, title, body } = req.body;\n    const { data, error } = await supabase.from(\"push_subscriptions\").select(\"subscription\").eq(\"user_id\", userId).single();\n    if (error || !data) return res.status(404).json({\n        error: \"No subscription\"\n    });\n    try {\n        await webpush.sendNotification(data.subscription, JSON.stringify({\n            title,\n            body\n        }));\n        res.status(200).json({\n            success: true\n        });\n    } catch (err) {\n        res.status(500).json({\n            error: err.message\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvc2VuZC1wdXNoLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFxRDtBQUVyRCxNQUFNQyxtQkFDSiwyRkFBMkYsK0JBQStCO0FBQzVILE1BQU1DLG9CQUFvQiwrQ0FBK0MsNkJBQTZCO0FBRXRHLE1BQU1DLFdBQVdILG1FQUFZQSxDQUMzQkksMENBQW9DRSxFQUNwQ0Ysa05BQXlDRztBQUc1QixlQUFlQyxRQUFRQyxHQUFHLEVBQUVDLEdBQUc7SUFDNUMscUVBQXFFO0lBQ3JFLE1BQU1DLFVBQVUsQ0FBQyxNQUFNLHNIQUFpQixFQUFHQztJQUUzQ0QsUUFBUUUsZ0JBQ04scUNBQ0FaLGtCQUNBQztJQUdGLElBQUlPLElBQUlLLFdBQVcsUUFBUSxPQUFPSixJQUFJSyxPQUFPLEtBQUtDO0lBQ2xELE1BQU0sRUFBRUMsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRSxHQUFHVixJQUFJVTtJQUNwQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTWxCLFNBQzNCbUIsS0FBSyxzQkFDTEMsT0FBTyxnQkFDUEMsR0FBRyxXQUFXUCxRQUNkUTtJQUNILElBQUlKLFNBQVMsQ0FBQ0QsTUFBTSxPQUFPVixJQUFJSyxPQUFPLEtBQUtXLEtBQUs7UUFBRUwsT0FBTztJQUFrQjtJQUMzRSxJQUFJO1FBQ0YsTUFBTVYsUUFBUWdCLGlCQUNaUCxLQUFLUSxjQUNMQyxLQUFLQyxVQUFVO1lBQUVaO1lBQU9DO1FBQUs7UUFFL0JULElBQUlLLE9BQU8sS0FBS1csS0FBSztZQUFFSyxTQUFTO1FBQUs7SUFDdkMsRUFBRSxPQUFPQyxLQUFLO1FBQ1p0QixJQUFJSyxPQUFPLEtBQUtXLEtBQUs7WUFBRUwsT0FBT1csSUFBSUM7UUFBUTtJQUM1QztBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZG9kby1lbnNlbWJsZS8uL3BhZ2VzL2FwaS9zZW5kLXB1c2guanM/YWIwNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL3N1cGFiYXNlLWpzXCI7XG5cbmNvbnN0IFZBUElEX1BVQkxJQ19LRVkgPVxuICBcIkJJbnpLRklrZEo1anMzYUJKYlpmcEotSlQ3WXlxb2owUU5NSHQ4aFFMQ3lSaUdVaEV1M0FsNFdiVlJPWGZVYVEwMnpaZUw2Uk80VXVhTVAybExZYmlHQVwiOyAvLyBSZW1wbGFjZSBwYXIgdGEgY2zDqSBwdWJsaXF1ZVxuY29uc3QgVkFQSURfUFJJVkFURV9LRVkgPSBcInJ0Zk5RVTRfenNhSlZMUklwRXRvQ002cDlKeXZ2X0J0RXdHdEgwZ1J4Y1FcIjsgLy8gUmVtcGxhY2UgcGFyIHRhIGNsw6kgcHJpdsOpZVxuXG5jb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChcbiAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMLFxuICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWVxuKTtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICAvLyBJbXBvcnQgZHluYW1pcXVlIGRlIHdlYi1wdXNoIHBvdXIgw6l2aXRlciBsJ2VycmV1ciBkZSBidWlsZCBOZXh0LmpzXG4gIGNvbnN0IHdlYnB1c2ggPSAoYXdhaXQgaW1wb3J0KFwid2ViLXB1c2hcIikpLmRlZmF1bHQ7XG5cbiAgd2VicHVzaC5zZXRWYXBpZERldGFpbHMoXG4gICAgXCJtYWlsdG86dmljdG9yLndhbWJlcnNpZUBnbWFpbC5jb21cIixcbiAgICBWQVBJRF9QVUJMSUNfS0VZLFxuICAgIFZBUElEX1BSSVZBVEVfS0VZXG4gICk7XG5cbiAgaWYgKHJlcS5tZXRob2QgIT09IFwiUE9TVFwiKSByZXR1cm4gcmVzLnN0YXR1cyg0MDUpLmVuZCgpO1xuICBjb25zdCB7IHVzZXJJZCwgdGl0bGUsIGJvZHkgfSA9IHJlcS5ib2R5O1xuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgIC5mcm9tKFwicHVzaF9zdWJzY3JpcHRpb25zXCIpXG4gICAgLnNlbGVjdChcInN1YnNjcmlwdGlvblwiKVxuICAgIC5lcShcInVzZXJfaWRcIiwgdXNlcklkKVxuICAgIC5zaW5nbGUoKTtcbiAgaWYgKGVycm9yIHx8ICFkYXRhKSByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJObyBzdWJzY3JpcHRpb25cIiB9KTtcbiAgdHJ5IHtcbiAgICBhd2FpdCB3ZWJwdXNoLnNlbmROb3RpZmljYXRpb24oXG4gICAgICBkYXRhLnN1YnNjcmlwdGlvbixcbiAgICAgIEpTT04uc3RyaW5naWZ5KHsgdGl0bGUsIGJvZHkgfSlcbiAgICApO1xuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJjcmVhdGVDbGllbnQiLCJWQVBJRF9QVUJMSUNfS0VZIiwiVkFQSURfUFJJVkFURV9LRVkiLCJzdXBhYmFzZSIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJ3ZWJwdXNoIiwiZGVmYXVsdCIsInNldFZhcGlkRGV0YWlscyIsIm1ldGhvZCIsInN0YXR1cyIsImVuZCIsInVzZXJJZCIsInRpdGxlIiwiYm9keSIsImRhdGEiLCJlcnJvciIsImZyb20iLCJzZWxlY3QiLCJlcSIsInNpbmdsZSIsImpzb24iLCJzZW5kTm90aWZpY2F0aW9uIiwic3Vic2NyaXB0aW9uIiwiSlNPTiIsInN0cmluZ2lmeSIsInN1Y2Nlc3MiLCJlcnIiLCJtZXNzYWdlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./pages/api/send-push.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/send-push.js"));
module.exports = __webpack_exports__;

})();