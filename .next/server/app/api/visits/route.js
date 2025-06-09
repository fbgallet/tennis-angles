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
exports.id = "app/api/visits/route";
exports.ids = ["app/api/visits/route"];
exports.modules = {

/***/ "(rsc)/./app/api/visits/route.ts":
/*!*********************************!*\
  !*** ./app/api/visits/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst VISITS_FILE = path__WEBPACK_IMPORTED_MODULE_2___default().join(process.cwd(), \"data\", \"visits.json\");\n// Ensure data directory exists\nasync function ensureDataDir() {\n    const dataDir = path__WEBPACK_IMPORTED_MODULE_2___default().dirname(VISITS_FILE);\n    try {\n        await fs__WEBPACK_IMPORTED_MODULE_1__.promises.access(dataDir);\n    } catch  {\n        await fs__WEBPACK_IMPORTED_MODULE_1__.promises.mkdir(dataDir, {\n            recursive: true\n        });\n    }\n}\n// Read visit count from file\nasync function getVisitCount() {\n    try {\n        await ensureDataDir();\n        const data = await fs__WEBPACK_IMPORTED_MODULE_1__.promises.readFile(VISITS_FILE, \"utf-8\");\n        const parsed = JSON.parse(data);\n        return parsed.visits || 0;\n    } catch  {\n        // File doesn't exist or is invalid, start with 0\n        return 0;\n    }\n}\n// Write visit count to file\nasync function saveVisitCount(count) {\n    try {\n        await ensureDataDir();\n        await fs__WEBPACK_IMPORTED_MODULE_1__.promises.writeFile(VISITS_FILE, JSON.stringify({\n            visits: count,\n            lastUpdated: new Date().toISOString()\n        }));\n    } catch (error) {\n        console.error(\"Failed to save visit count:\", error);\n    }\n}\nasync function GET() {\n    try {\n        const visits = await getVisitCount();\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            visits\n        });\n    } catch (error) {\n        console.error(\"Failed to get visit count:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            visits: 0\n        });\n    }\n}\nasync function POST() {\n    try {\n        const currentVisits = await getVisitCount();\n        const newVisits = currentVisits + 1;\n        await saveVisitCount(newVisits);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            visits: newVisits\n        });\n    } catch (error) {\n        console.error(\"Failed to increment visit count:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            visits: 0\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3Zpc2l0cy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQXdEO0FBQ3BCO0FBQ1o7QUFFeEIsTUFBTUksY0FBY0QsZ0RBQVMsQ0FBQ0csUUFBUUMsR0FBRyxJQUFJLFFBQVE7QUFFckQsK0JBQStCO0FBQy9CLGVBQWVDO0lBQ2IsTUFBTUMsVUFBVU4sbURBQVksQ0FBQ0M7SUFDN0IsSUFBSTtRQUNGLE1BQU1GLHdDQUFFQSxDQUFDUyxNQUFNLENBQUNGO0lBQ2xCLEVBQUUsT0FBTTtRQUNOLE1BQU1QLHdDQUFFQSxDQUFDVSxLQUFLLENBQUNILFNBQVM7WUFBRUksV0FBVztRQUFLO0lBQzVDO0FBQ0Y7QUFFQSw2QkFBNkI7QUFDN0IsZUFBZUM7SUFDYixJQUFJO1FBQ0YsTUFBTU47UUFDTixNQUFNTyxPQUFPLE1BQU1iLHdDQUFFQSxDQUFDYyxRQUFRLENBQUNaLGFBQWE7UUFDNUMsTUFBTWEsU0FBU0MsS0FBS0MsS0FBSyxDQUFDSjtRQUMxQixPQUFPRSxPQUFPRyxNQUFNLElBQUk7SUFDMUIsRUFBRSxPQUFNO1FBQ04saURBQWlEO1FBQ2pELE9BQU87SUFDVDtBQUNGO0FBRUEsNEJBQTRCO0FBQzVCLGVBQWVDLGVBQWVDLEtBQWE7SUFDekMsSUFBSTtRQUNGLE1BQU1kO1FBQ04sTUFBTU4sd0NBQUVBLENBQUNxQixTQUFTLENBQ2hCbkIsYUFDQWMsS0FBS00sU0FBUyxDQUFDO1lBQUVKLFFBQVFFO1lBQU9HLGFBQWEsSUFBSUMsT0FBT0MsV0FBVztRQUFHO0lBRTFFLEVBQUUsT0FBT0MsT0FBTztRQUNkQyxRQUFRRCxLQUFLLENBQUMsK0JBQStCQTtJQUMvQztBQUNGO0FBRU8sZUFBZUU7SUFDcEIsSUFBSTtRQUNGLE1BQU1WLFNBQVMsTUFBTU47UUFDckIsT0FBT2QscURBQVlBLENBQUMrQixJQUFJLENBQUM7WUFBRVg7UUFBTztJQUNwQyxFQUFFLE9BQU9RLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLDhCQUE4QkE7UUFDNUMsT0FBTzVCLHFEQUFZQSxDQUFDK0IsSUFBSSxDQUFDO1lBQUVYLFFBQVE7UUFBRTtJQUN2QztBQUNGO0FBRU8sZUFBZVk7SUFDcEIsSUFBSTtRQUNGLE1BQU1DLGdCQUFnQixNQUFNbkI7UUFDNUIsTUFBTW9CLFlBQVlELGdCQUFnQjtRQUNsQyxNQUFNWixlQUFlYTtRQUNyQixPQUFPbEMscURBQVlBLENBQUMrQixJQUFJLENBQUM7WUFBRVgsUUFBUWM7UUFBVTtJQUMvQyxFQUFFLE9BQU9OLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLG9DQUFvQ0E7UUFDbEQsT0FBTzVCLHFEQUFZQSxDQUFDK0IsSUFBSSxDQUFDO1lBQUVYLFFBQVE7UUFBRTtJQUN2QztBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvZmFicmljZS9DYXNjYWRlUHJvamVjdHMvdGVubmlzLWFuZ2xlLXRoZW9yeS9hcHAvYXBpL3Zpc2l0cy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBwcm9taXNlcyBhcyBmcyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuY29uc3QgVklTSVRTX0ZJTEUgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgXCJkYXRhXCIsIFwidmlzaXRzLmpzb25cIik7XG5cbi8vIEVuc3VyZSBkYXRhIGRpcmVjdG9yeSBleGlzdHNcbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZURhdGFEaXIoKSB7XG4gIGNvbnN0IGRhdGFEaXIgPSBwYXRoLmRpcm5hbWUoVklTSVRTX0ZJTEUpO1xuICB0cnkge1xuICAgIGF3YWl0IGZzLmFjY2VzcyhkYXRhRGlyKTtcbiAgfSBjYXRjaCB7XG4gICAgYXdhaXQgZnMubWtkaXIoZGF0YURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIH1cbn1cblxuLy8gUmVhZCB2aXNpdCBjb3VudCBmcm9tIGZpbGVcbmFzeW5jIGZ1bmN0aW9uIGdldFZpc2l0Q291bnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBlbnN1cmVEYXRhRGlyKCk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGZzLnJlYWRGaWxlKFZJU0lUU19GSUxFLCBcInV0Zi04XCIpO1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgcmV0dXJuIHBhcnNlZC52aXNpdHMgfHwgMDtcbiAgfSBjYXRjaCB7XG4gICAgLy8gRmlsZSBkb2Vzbid0IGV4aXN0IG9yIGlzIGludmFsaWQsIHN0YXJ0IHdpdGggMFxuICAgIHJldHVybiAwO1xuICB9XG59XG5cbi8vIFdyaXRlIHZpc2l0IGNvdW50IHRvIGZpbGVcbmFzeW5jIGZ1bmN0aW9uIHNhdmVWaXNpdENvdW50KGNvdW50OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBlbnN1cmVEYXRhRGlyKCk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKFxuICAgICAgVklTSVRTX0ZJTEUsXG4gICAgICBKU09OLnN0cmluZ2lmeSh7IHZpc2l0czogY291bnQsIGxhc3RVcGRhdGVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSlcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2F2ZSB2aXNpdCBjb3VudDpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmlzaXRzID0gYXdhaXQgZ2V0VmlzaXRDb3VudCgpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHZpc2l0cyB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGdldCB2aXNpdCBjb3VudDpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHZpc2l0czogMCB9KTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVCgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjdXJyZW50VmlzaXRzID0gYXdhaXQgZ2V0VmlzaXRDb3VudCgpO1xuICAgIGNvbnN0IG5ld1Zpc2l0cyA9IGN1cnJlbnRWaXNpdHMgKyAxO1xuICAgIGF3YWl0IHNhdmVWaXNpdENvdW50KG5ld1Zpc2l0cyk7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdmlzaXRzOiBuZXdWaXNpdHMgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBpbmNyZW1lbnQgdmlzaXQgY291bnQ6XCIsIGVycm9yKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB2aXNpdHM6IDAgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJwcm9taXNlcyIsImZzIiwicGF0aCIsIlZJU0lUU19GSUxFIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJlbnN1cmVEYXRhRGlyIiwiZGF0YURpciIsImRpcm5hbWUiLCJhY2Nlc3MiLCJta2RpciIsInJlY3Vyc2l2ZSIsImdldFZpc2l0Q291bnQiLCJkYXRhIiwicmVhZEZpbGUiLCJwYXJzZWQiLCJKU09OIiwicGFyc2UiLCJ2aXNpdHMiLCJzYXZlVmlzaXRDb3VudCIsImNvdW50Iiwid3JpdGVGaWxlIiwic3RyaW5naWZ5IiwibGFzdFVwZGF0ZWQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJlcnJvciIsImNvbnNvbGUiLCJHRVQiLCJqc29uIiwiUE9TVCIsImN1cnJlbnRWaXNpdHMiLCJuZXdWaXNpdHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/visits/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvisits%2Froute&page=%2Fapi%2Fvisits%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvisits%2Froute.ts&appDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvisits%2Froute&page=%2Fapi%2Fvisits%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvisits%2Froute.ts&appDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_fabrice_CascadeProjects_tennis_angle_theory_app_api_visits_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/visits/route.ts */ \"(rsc)/./app/api/visits/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/visits/route\",\n        pathname: \"/api/visits\",\n        filename: \"route\",\n        bundlePath: \"app/api/visits/route\"\n    },\n    resolvedPagePath: \"/Users/fabrice/CascadeProjects/tennis-angle-theory/app/api/visits/route.ts\",\n    nextConfigOutput,\n    userland: _Users_fabrice_CascadeProjects_tennis_angle_theory_app_api_visits_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ2aXNpdHMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnZpc2l0cyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnZpc2l0cyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmZhYnJpY2UlMkZDYXNjYWRlUHJvamVjdHMlMkZ0ZW5uaXMtYW5nbGUtdGhlb3J5JTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmZhYnJpY2UlMkZDYXNjYWRlUHJvamVjdHMlMkZ0ZW5uaXMtYW5nbGUtdGhlb3J5JmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUMwQjtBQUN2RztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL2ZhYnJpY2UvQ2FzY2FkZVByb2plY3RzL3Rlbm5pcy1hbmdsZS10aGVvcnkvYXBwL2FwaS92aXNpdHMvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3Zpc2l0cy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3Zpc2l0c1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdmlzaXRzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2ZhYnJpY2UvQ2FzY2FkZVByb2plY3RzL3Rlbm5pcy1hbmdsZS10aGVvcnkvYXBwL2FwaS92aXNpdHMvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvisits%2Froute&page=%2Fapi%2Fvisits%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvisits%2Froute.ts&appDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvisits%2Froute&page=%2Fapi%2Fvisits%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvisits%2Froute.ts&appDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffabrice%2FCascadeProjects%2Ftennis-angle-theory&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();