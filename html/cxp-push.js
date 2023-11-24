(function () {
    "use strict";
    angular.module("cxp-push.adobe", ["arq-spa-base", "arq-spa-mobile"]);
})();
(function () {
    "use strict";

    angular.module("cxp-push.adobe").service("cxpPushAdobe", service);

    service.$inject = ["$q", "appSettings", "sfUtilitarios", "sfConectorAPI", "sfUrlContainer", "sfMemorizador", "cxpUtilService"];

    function service($q, appSettings, sfUtilitarios, sfConectorAPI, sfUrlContainer, sfMemorizador, cxpUtilService) {

        var FORNECEDOR = "Adobe";

        return {
            ativar: ativar,
            isAtivado: isAtivado,
            isHabilitado: isHabilitado
        };

        /**
         * @description
         * Método responsável por retornar a chave usada para armazenar/consultar localStorage
         * 
         * @param {String} customerID Chave que identifica o usuário
         * @returns {String} Chave que identifica o usuário no localStorage
         */
        function getMemorizadorChave(customerID) {
            return `cxpPush:${FORNECEDOR}:${customerID}`;
        }

        /**
         * @description
         * Método responsável por ativar as notificações push no dispositivo, do fornecedor Adobe
         * 
         * @param {String} customerID Chave que identifica o usuário
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function ativar(customerID, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxpPushAdobe.ativar", "Início de execução.");

            if (!isHabilitado()) {
                cxpUtilService.info("cxpPushAdobe.ativar", "Não habilitado.");
                defer.resolve(tratarRetorno({ message: "Não habilitado." }));
            } else if (isCacheHabilitado() && isAtivado(customerID)) {
                cxpUtilService.info("cxpPushAdobe.ativar", "Já ativo.");
                defer.resolve(tratarRetorno({ message: "Já ativo." }));
            } else {
                var configHttp = {
                    method: "POST",
                    url: sfUtilitarios.combinarCaminhos([sfUrlContainer.obter(), "notificacao/adobe/ativar"]),
                    data: {
                        customerID: customerID
                    }
                };

                exibirLoader = exibirLoader || false; // Caso "undefined", atribui "false", pois o sfConectorAPI exibe loader se "undefined"
                sfConectorAPI.executar(configHttp, exibirLoader, mensagem)
                    .then(function (res) {
                        setAtivado(customerID);
                        defer.resolve(tratarRetorno(res));
                    })
                    .catch(function (err) {
                        cxpUtilService.erro("cxpPushAdobe.ativar", "Erro na execução: ", err);
                        setDesativado(customerID);
                        defer.reject(tratarRetorno(err));
                    });
            }
            cxpUtilService.info("cxpPushAdobe.ativar", "Término de execução.");
            return defer.promise;
        }

        /**
         * @description
         * Método responsável por verificar se o push do fornecedor está habilitada pelo canal
         * 
         * @returns {Boolean} Indicador se o push do fornecedor está habilitado
         */
        function isHabilitado() {
            return (appSettings.cxpPush != null) && (appSettings.cxpPush[FORNECEDOR] != null);
        }

        /**
         * @description
         * Método responsável por verificar se a notificação está ativa
         * 
         * @param {String} customerID Chave que identifica o usuário
         * @returns {Boolean} Indicador se push está ativo
         */
        function isAtivado(customerID) {
            return !!sfMemorizador.obter(getMemorizadorChave(customerID));
        }

        /**
         * @description
         * Método responsável por verificar se o cache está habilitado para o fornecedor
         * 
         * @returns {Boolean} Indicador se push está ativo
         */
        function isCacheHabilitado() {
            return appSettings.cxpPush && typeof appSettings.cxpPush[FORNECEDOR] === "object" && appSettings.cxpPush[FORNECEDOR].cache;
        }

        /**
         * @description
         * Método responsável por armazenar no localStorage se o push está ativo
         * 
         * @param {String} customerID Chave que identifica o usuário
         */
        function setAtivado(customerID) {
            if (isCacheHabilitado()) {
                cxpUtilService.info("cxpPushAdobe.setAtivado", "Início de execução.");
                sfMemorizador.definir(getMemorizadorChave(customerID), true);
            }
        }

        /**
         * @description
         * Método responsável por remover o localStorage que indica que o push está ativo
         * 
         * @param {String} customerID Chave que identifica o usuário
         */
        function setDesativado(customerID) {
            if (isCacheHabilitado()) {
                cxpUtilService.info("cxpPushAdobe.setDesativado", "Início de execução.");
                sfMemorizador.removerChave(getMemorizadorChave(customerID));
            }
        }

        /**
         * @description
         * Metodo recebe o objeto que será retornado para o canal e inclui o "ID" do fornecedor
         * 
         * @param {Object} retorno 
         */
        function tratarRetorno(retorno) {
            if (retorno && typeof retorno === "object") {
                retorno.id = FORNECEDOR;
            }
            return retorno;
        }

    }
})();
(function () {
    "use strict";
    angular.module("cxp-push.cxp", ["arq-spa-base", "arq-spa-mobile"]);
})();
(function () {
    "use strict";

    angular.module("cxp-push.cxp").service("cxp", service);

    service.$inject = ["$q", "$window", "appSettings", "sfUtilitarios", "sfConectorAPI", "sfUrlContainer", "sfMemorizador", "cxpUtilService"];

    function service($q, $window, appSettings, sfUtilitarios, sfConectorAPI, sfUrlContainer, sfMemorizador, cxpUtilService) {

        var FORNECEDOR = "CXP";

        return {
            ativar: ativar,
            isAtivado: isAtivado,
            isHabilitado: isHabilitado
        };

        /**
         * @description
         * Método responsável por retornar a chave usada para armazenar/consultar localStorage
         * 
         * @param {String} chave Chave que identifica o usuário
         * @returns {String} Chave que identifica o usuário no localStorage
         */
        function getMemorizadorChave(chave) {
            return `cxpPush:${FORNECEDOR}:${chave}`;
        }

        /**
         * @description
         * Método responsável por ativar as notificações push no dispositivo, do fornecedor Oracle
         * 
         * @param {String} chave Chave que identifica o usuário (IdUnico)
         * @param {String} clienteCanal  Chave que identifica o usuário
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function ativar(chave, clienteCanal, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxp.ativar", "Início de execução.");

            if (!isHabilitado()) {
                cxpUtilService.info("cxp.ativar", "Não habilitado.");
                defer.resolve(tratarRetorno({ message: "Não habilitado." }));
            } else if (isAtivado(chave)) {
                cxpUtilService.info("cxp.ativar", "Já ativo.");
                defer.resolve(tratarRetorno({ message: "Já ativo." }));
            } else {
                ativarDispositivo(chave,clienteCanal, exibirLoader, mensagem)
                            .then(defer.resolve)
                            .catch(defer.reject);
            }
            cxpUtilService.info("cxp.ativar", "Término de execução.");
            return defer.promise;
        }

        
        /**
         * @description
         * Método responsável por ativar as notificações push do dispositivo junto ao CXP
         * 
         * @param {String} chave Chave que identifica o usuário
         * @param {String} clienteCanal ShortName + documento
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function ativarDispositivo(chave, clienteCanal, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxp.ativarDispositivo", "Início de execução.");
            getFcmToken(chave, exibirLoader, mensagem)
            .then(function (fcmToken) {
                cxpUtilService.info("cxp.ativarDispositivo", "retorno fcm token - " + JSON.stringify(fcmToken));
                var params = {
                    plataforma: getUserAgent(),
                    idClienteSistemaOrigem: clienteCanal,
                    idUnicoUsuario: chave,
                    tokenDispositivo: fcmToken
                };
                cxpUtilService.info("cxp.ativarDispositivo", "parametro chamada " + JSON.stringify(params));
                var configHttp = {
                    method: "POST",
                    url: appSettings.cxpPush[FORNECEDOR].endpointAtivarDispositivo,
                    data: params,
                    dataType: "json"
                };
                cxpUtilService.info("cxp.ativarDispositivo", "configHttp " + JSON.stringify(configHttp));
                exibirLoader = exibirLoader || false;
                sfConectorAPI.executar(configHttp, exibirLoader, mensagem)
                    .then(function (res) {
                        cxpUtilService.info("cxp.ativarDispositivo", "retorno api push - " + JSON.stringify(res));
                        setAtivado(chave);
                        defer.resolve(tratarRetorno(res));
                    })
                    .catch(function (err) {
                        cxpUtilService.info("cxp.ativarDispositivo", "retorno api push erro - " + JSON.stringify(err));
                        setDesativado(chave);
                        defer.reject(tratarRetorno(err));
                    });
            })
            .catch(function (err) {
                cxpUtilService.info("cxp.ativarDispositivo", "retorno getFcmToken erro - " + JSON.stringify(err));
                defer.reject(tratarRetorno(err));
            });
            cxpUtilService.info("cxp.ativarDispositivo", "Término de execução.");
            return defer.promise;
        }

        /**
         * @description
         * Método responsável por chamar o container e retornar o FCM Token
         * 
         * @param {String} chave Chave que identifica o usuário
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
         function getFcmToken(chave, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxp.getFcmToken", "Início de execução.");
            verificar(chave, exibirLoader, mensagem)
                .then(function (res) {
                    cxpUtilService.info("cxp.getFcmToken", "getFcmToken - " + JSON.stringify(res));
                    var fcmToken = res && res.data && res.data.token;
                    if (!fcmToken) {
                        defer.reject(tratarRetorno({ message: "Parametro (fcmToken) obrigatório não retornado do container." }));
                    } else {
                        defer.resolve(fcmToken);
                    }
                }).catch(function (err) {
                    setDesativado(chave);
                    defer.reject(tratarRetorno(err));
                });
            cxpUtilService.info("cxp.getFcmToken", "Término de execução.");
            return defer.promise;
        }

        /**
         * @description
         * Método responsável por buscar o token do firebase
         * 
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function verificar(exibirLoader, mensagem) {
            cxpUtilService.info("cxp.verificar", "Início de execução.");

            var configHttp = {
                method: "GET",
                url: sfUtilitarios.combinarCaminhos([sfUrlContainer.obter(), "notificacao/firebase/fcmToken"])
            };

            cxpUtilService.info("cxp.verificar", "Término de execução.");
            return sfConectorAPI.executar(configHttp, exibirLoader, mensagem);
        }

        /**
         * @description
         * Método responsável por verificar se o push do fornecedor está habilitada pelo canal
         * 
         * @returns {Boolean} Indicador se o push do fornecedor está habilitado
         */
        function isHabilitado() {
            return (appSettings.cxpPush != null) && (appSettings.cxpPush[FORNECEDOR] != null);
        }

        /**
         * @description
         * Método responsável por verificar se a notificação está ativa
         * 
         * @param {String} chave Chave que identifica o usuário
         * @returns {Boolean} Indicador se push está ativo
         */
        function isAtivado(chave) {
            return !!sfMemorizador.obter(getMemorizadorChave(chave));
        }

        /**
         * @description
         * Método responsável por armazenar no localStorage se o push está ativo
         * 
         * @param {String} chave Chave que identifica o usuário
         */
        function setAtivado(chave) {
            cxpUtilService.info("cxp.setAtivado", "Início de execução.");
            sfMemorizador.definir(getMemorizadorChave(chave), true);
        }

        /**
         * @description
         * Método responsável por remover o localStorage que indica que o push está ativo
         * 
         * @param {String} chave Chave que identifica o usuário
         */
        function setDesativado(chave) {
            cxpUtilService.info("cxp.setDesativado", "Início de execução.");
            sfMemorizador.removerChave(getMemorizadorChave(chave));
        }

        /**
         * @description
         * Metodo, atraves do userAgent do WebView, determina e retorna o sistema operacional do dispositivo
         * 
         * @returns Sistema Operacional do dispositivo
         */
        function getUserAgent() {
            var userAgent = $window.navigator.userAgent.toLowerCase();
            if (userAgent.match("iphone") || userAgent.match("ipad") || userAgent.match("mac") || userAgent.match("Mac")) {
                return "iOS";
            } else if (userAgent.match("android")) {
                return "Android";
            }
            return "DESCONHECIDO";
        }

        /**
         * @description
         * Metodo recebe o objeto que será retornado para o canal e inclui o "ID" do fornecedor
         * 
         * @param {Object} retorno 
         */
        function tratarRetorno(retorno) {
            if (retorno && typeof retorno === "object") {
                retorno.id = FORNECEDOR;
                if(retorno.message){
                    retorno.message;
                }
            }
            return retorno;
        }

    }
})();
(function () {
    "use strict";
    angular.module("cxp-push.oracle", ["arq-spa-base", "arq-spa-mobile"]);
})();
(function () {
    "use strict";

    angular.module("cxp-push.oracle").service("cxpPushOracle", service);

    service.$inject = ["$q", "$window", "appSettings", "sfUtilitarios", "sfConectorAPI", "sfUrlContainer", "sfMemorizador", "cxpUtilService"];

    function service($q, $window, appSettings, sfUtilitarios, sfConectorAPI, sfUrlContainer, sfMemorizador, cxpUtilService) {

        var FORNECEDOR = "Oracle";

        return {
            ativar: ativar,
            isAtivado: isAtivado,
            isHabilitado: isHabilitado
        };

        /**
         * @description
         * Método responsável por retornar a chave usada para armazenar/consultar localStorage
         * 
         * @param {String} chave Chave que identifica o usuário
         * @returns {String} Chave que identifica o usuário no localStorage
         */
        function getMemorizadorChave(chave) {
            return `cxpPush:${FORNECEDOR}:${chave}`;
        }

        /**
         * @description
         * Método responsável por ativar as notificações push no dispositivo, do fornecedor Oracle
         * 
         * @param {String} chave Chave que identifica o usuário
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function ativar(chave, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxpPushOracle.ativar", "Início de execução.");

            if (!isHabilitado()) {
                cxpUtilService.info("cxpPushOracle.ativar", "Não habilitado.");
                defer.resolve(tratarRetorno({ message: "Não habilitado." }));
            } else if (isAtivado(chave)) {
                cxpUtilService.info("cxpPushOracle.ativar", "Já ativo.");
                defer.resolve(tratarRetorno({ message: "Já ativo." }));
            } else {
                var configHttp = {
                    method: "POST",
                    url: sfUtilitarios.combinarCaminhos([sfUrlContainer.obter(), "notificacao/ativar"]),
                    data: {
                        chave: chave
                    }
                };

                exibirLoader = exibirLoader || false; // Caso "undefined", atribui "false", pois o sfConectorAPI exibe loader se "undefined"
                sfConectorAPI.executar(configHttp, exibirLoader, mensagem)
                    .then(function () {
                        ativarDispositivo(chave, exibirLoader, mensagem)
                            .then(defer.resolve)
                            .catch(defer.reject);
                    })
                    .catch(function (err) {
                        cxpUtilService.erro("cxpPushOracle.ativar", "Erro na execução: ", err);
                        setDesativado(chave);
                        defer.reject(tratarRetorno(err));
                    });
            }
            cxpUtilService.info("cxpPushOracle.ativar", "Término de execução.");
            return defer.promise;
        }

        /**
         * @description
         * Método responsável por ativar as notificações push do dispositivo junto ao PSN
         * 
         * @param {String} chave Chave que identifica o usuário
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function ativarDispositivo(chave, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxpPushOracle.ativarDispositivo", "Início de execução.");
            getDeviceId(chave, exibirLoader, mensagem)
                .then(function (deviceId) {
                    var params = {
                        plataforma: getUserAgent(),
                        userKey: chave,
                        deviceId: deviceId
                    };
                    var configHttp = {
                        method: appSettings.cxpPush[FORNECEDOR].metodoAtivarDispositivo,
                        url: appSettings.cxpPush[FORNECEDOR].endpointAtivarDispositivo,
                        data: params,
                        dataType: "json"
                    };
                    exibirLoader = exibirLoader || false;
                    sfConectorAPI.executar(configHttp, exibirLoader, mensagem)
                        .then(function (res) {
                            setAtivado(chave);
                            defer.resolve(tratarRetorno(res));
                        })
                        .catch(function (err) {
                            setDesativado(chave);
                            defer.reject(tratarRetorno(err));
                        });
                })
                .catch(function (err) {
                    defer.reject(tratarRetorno(err));
                });
            cxpUtilService.info("cxpPushOracle.ativarDispositivo", "Término de execução.");
            return defer.promise;
        }

        /**
         * @description
         * Método responsável por chamar o container e retornar o deviceId
         * 
         * @param {String} chave Chave que identifica o usuário
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function getDeviceId(chave, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxpPushOracle.getDeviceId", "Início de execução.");
            verificar(chave, exibirLoader, mensagem)
                .then(function (res) {
                    var deviceId = res && res.data && res.data.deviceId;
                    if (!deviceId) {
                        defer.reject(tratarRetorno({ message: "Parametro (deviceId) obrigatório não retornado do container." }));
                    } else {
                        defer.resolve(deviceId);
                    }
                }).catch(function (err) {
                    setDesativado(chave);
                    defer.reject(tratarRetorno(err));
                });
            cxpUtilService.info("cxpPushOracle.getDeviceId", "Término de execução.");
            return defer.promise;
        }

        /**
         * @description
         * Método responsável por verificar se o push do fornecedor está habilitada pelo canal
         * 
         * @returns {Boolean} Indicador se o push do fornecedor está habilitado
         */
        function isHabilitado() {
            return !!(appSettings.cxpPush && appSettings.cxpPush[FORNECEDOR]);
        }

        /**
         * @description
         * Método responsável por verificar se a notificação está ativa
         * 
         * @param {String} chave Chave que identifica o usuário
         * @returns {Boolean} Indicador se push está ativo
         */
        function isAtivado(chave) {
            return !!sfMemorizador.obter(getMemorizadorChave(chave));
        }

        /**
         * @description
         * Método responsável por armazenar no localStorage se o push está ativo
         * 
         * @param {String} chave Chave que identifica o usuário
         */
        function setAtivado(chave) {
            cxpUtilService.info("cxpPushOracle.setAtivado", "Início de execução.");
            sfMemorizador.definir(getMemorizadorChave(chave), true);
        }

        /**
         * @description
         * Método responsável por remover o localStorage que indica que o push está ativo
         * 
         * @param {String} chave Chave que identifica o usuário
         */
        function setDesativado(chave) {
            cxpUtilService.info("cxpPushOracle.setDesativado", "Início de execução.");
            sfMemorizador.removerChave(getMemorizadorChave(chave));
        }

        /**
         * @description
         * Metodo, atraves do userAgent do WebView, determina e retorna o sistema operacional do dispositivo
         * 
         * @returns Sistema Operacional do dispositivo
         */
        function getUserAgent() {
            var userAgent = $window.navigator.userAgent.toLowerCase();
            if (userAgent.match("iphone") || userAgent.match("ipad") || userAgent.match("mac") || userAgent.match("Mac")) {
                return "IOS";
            } else if (userAgent.match("android")) {
                return "ANDROID";
            }
            return "DESCONHECIDO";
        }

        /**
         * @description
         * Metodo recebe o objeto que será retornado para o canal e inclui o "ID" do fornecedor
         * 
         * @param {Object} retorno 
         */
        function tratarRetorno(retorno) {
            if (retorno && typeof retorno === "object") {
                retorno.id = FORNECEDOR;
            }
            return retorno;
        }

        /**
         * @description
         * Método responsável por verificar se a notificação está ativa e qual usuário está vinculado
         * 
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function verificar(exibirLoader, mensagem) {
            cxpUtilService.info("cxpPushOracle.verificar", "Início de execução.");

            var configHttp = {
                method: "POST",
                url: sfUtilitarios.combinarCaminhos([sfUrlContainer.obter(), "notificacao/verificar"]),
                data: {}
            };

            cxpUtilService.info("cxpPushOracle.verificar", "Término de execução.");
            return sfConectorAPI.executar(configHttp, exibirLoader, mensagem);
        }

        /**
         * Abaixo são metodo disponiveis no container, endpoints existentes, mas que no momento da concepção dessa lib não possuem uso
         */

        /**
         * @description
         * Obtem as informações de notificação
         * 
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        // function obter(exibirLoader, mensagem) {
        //     cxpUtilService.info("cxpPushOracle.obter", "Início de execução.");

        //     var configHttp = {
        //         method: "GET",
        //         url: sfUtilitarios.combinarCaminhos([sfUrlContainer.obter(), "notificacao/obter"])
        //     };

        //     cxpUtilService.info("cxpPushOracle.obter", "Término de execução.");
        //     return sfConectorAPI.executar(configHttp, exibirLoader, mensagem);
        // }

        /**
         * @description
         * Método responsável por desativar as notificações push no dispositivo, do fornecedor Oracle
         * 
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        // function desativar(exibirLoader, mensagem) {
        //     cxpUtilService.info("cxpPushOracle.desativar", "Início de execução.");

        //     var configHttp = {
        //         method: "POST",
        //         url: sfUtilitarios.combinarCaminhos([sfUrlContainer.obter(), "notificacao/desativar"]),
        //         data: {}
        //     };

        //     cxpUtilService.info("cxpPushOracle.desativar", "Término de execução.");
        //     return sfConectorAPI.executar(configHttp, exibirLoader, mensagem);
        // }

        /**
         * @description
         * Retorna o valor origem localizado na rota da aplicação.
         * 
         * @returns string Valor da querystring origem na rota da URL
         */
        // function obterOrigemUrl() {
        //     var informacoesUrl = $location.search();
        //     var origem = "";

        //     if (angular.isDefined(informacoesUrl) && "origem" in informacoesUrl) {
        //         origem = informacoesUrl.origem;
        //     }
        //     return origem;
        // }

    }
})();
(function () {
    "use strict";
    angular.module("cxp-push.util", ["arq-spa-base", "cxp-push.oracle", "cxp-push.adobe", "cxp-push.cxp"]);
})();
(function () {
    "use strict";
    angular.module("cxp-push.util").service("cxpPushService", service);

    service.$inject = ["$q", "cxpPushOracle", "cxpPushAdobe", "cxpUtilService", "cxp"];

    function service($q, cxpPushOracle, cxpPushAdobe, cxpUtilService, cxp) {
        return {
            ativar: ativar
        };

        /**
         * @description
         * Método responsável por ativar as notificações push no dispositivo
         * 
         * @param {Any} customerParams Chaves que identificam o usuário
         * @param {Boolean} exibirLoader Indicador de exibição do loader
         * @param {String} mensagem Mensagem que será exibida no loader
         */
        function ativar(customerParams, exibirLoader, mensagem) {
            var defer = $q.defer();
            cxpUtilService.info("cxpPushService.ativar", "Início de execução.");

            var idOracle = null;
            var idAdobe = null;
            var idCxp = null;
            var chaveUsuarioCxp = null;
            if (typeof customerParams === "object") {
                idOracle = customerParams.chaveUsuario;
                idAdobe = customerParams.idUnico;
                idCxp = customerParams.idUnico;
                chaveUsuarioCxp = customerParams.chaveUsuario;

            } else {
                idOracle = customerParams;
                idAdobe = customerParams;
                idCxp = customerParams;
            }

            if (!idOracle && !idAdobe && !idCxp) {
                var message = "Parametros obrigatórios não informados.";
                cxpUtilService.info("cxpPushService.ativar", message);
                defer.reject({ message: message });
            } else {
                var promisesAtivacao =
                    [
                        cxpPushOracle.ativar(idOracle, exibirLoader, mensagem),
                        cxpPushAdobe.ativar(idAdobe, exibirLoader, mensagem),
                        cxp.ativar(idCxp, chaveUsuarioCxp, exibirLoader, mensagem)
                    ];
                $q.all(promisesAtivacao)
                    .then(function (res) {
                        cxpUtilService.info("cxpPushService.ativar", "Sucesso na execução: ", res);
                        defer.resolve(res);
                    })
                    .catch(function (err) {
                        cxpUtilService.erro("cxpPushService.ativar", "Erro na execução: ", err);
                        defer.reject(err);
                    });
            }
            cxpUtilService.info("cxpPushService.ativar", "Término de execução.");

            return defer.promise;
        }
    }
})();
(function () {
    "use strict";
    angular.module("cxp-push.util").service("cxpUtilService", service);

    service.$inject = ["$log", "$timeout", "sfLogger", "sfNavegador"];

    function service($log, $timeout, sfLogger, sfNavegador) {
        return {
            info: info,
            erro: erro
        };

        function info(function_, msg_, extra_) {
            $timeout(function () {
                msg_ = msg_ + parseExtra(extra_);
                var estadoAtual = sfNavegador.obterEstadoAtual();
                var fluxo = estadoAtual && estadoAtual.fluxoAtual && estadoAtual.fluxoAtual.idFluxo();
                var estado = estadoAtual && estadoAtual.id;
                sfLogger.escreverLogExecucao(msg_, function_, fluxo, estado, "info", { classe: "cxp-push", metodo: function_ });
                $log.info(msg_);
            }, 1);
        }

        function erro(function_, msg_, extra_) {
            $timeout(function () {
                msg_ = msg_ + parseExtra(extra_);
                sfLogger.escreverLogErro(msg_, null, "Alta", { classe: "cxp-push", metodo: function_ });
                $log.error(msg_);
            }, 1);
        }

        function parseExtra(extra_) {
            return (extra_ && typeof extra_ === "object") ? JSON.stringify(extra_) : (extra_ !== undefined ? extra_ : "");
        }
    }
})();
(function () {
    "use strict";
    angular.module("cxp-push", [
        "arq-spa-base",
        "arq-spa-mobile",
        "cxp-push.util",
        "cxp-push.oracle",
        "cxp-push.adobe",
        "cxp-push.cxp"]);
})();