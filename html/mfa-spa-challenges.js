(function () {
    "use strict";

    angular.module("mfa-spa-challenges.challenges", ["arq-spa-base", "mfa-spa-challenges.util"]).run(executar);

    executar.$inject = ["appSettings", "mfaChallengesConstants", "mfaChallengesFactory"];

    function executar(appSettings, mfaChallengesConstants, mfaChallengesFactory) {

        function registerPublicChallenges() {
            var publicChallenges = appSettings.mfa && appSettings.mfa.challenges;
            if (publicChallenges && Array.isArray(publicChallenges)) {
                registerChallenges(publicChallenges);
            }
        }

        function registerPrivateChallenges() {
            var privateChallenges = mfaChallengesConstants;
            if (privateChallenges && Array.isArray(privateChallenges)) {
                registerChallenges(privateChallenges);
            }
        }

        function registerChallenges(challenges_) {
            challenges_.forEach(function (challenge_) {
                mfaChallengesFactory.set(challenge_.name, challenge_.journey);
            });
        }

        registerPublicChallenges();
        registerPrivateChallenges();
    }
})();
(function () {
    "use strict";

    angular.module("mfa-spa-challenges.challenges")
        .constant("mfaChallengesConstants", [
            {
                name: "FACEMATCH",
                journey: "mfaFacematch"
            }
        ]);
})();
(function () {
    "use strict";

    angular.module("mfa-spa-challenges.challenges").factory("mfaChallengesFactory", factory);

    factory.$inject = ["mfaUtilService"];

    function factory(mfaUtilService) {

        var challenges = [];

        return {
            set: set,
            get: get
        };

        function set(challengeName_, challengeJourney_) {
            if (challengeName_ && challengeJourney_) {
                challenges[normalize(challengeName_)] = challengeJourney_;
            }
        }

        function get(challengeName_) {
            if (!challengeName_) {
                mfaUtilService.erro("mfaUtilService.get",
                    "Nome do desafio recebido vazio!");
            } else if (!challenges[normalize(challengeName_)]) {
                mfaUtilService.erro("mfaUtilService.get",
                    "Desafio solicitado, \"" + challengeName_ + "\", não possui jornada registrada.");
            }
            return challenges[normalize(challengeName_)];
        }

        function normalize(name_) {
            return name_.toUpperCase();
        }
    }
})();
(function () {
    "use strict";

    angular.module("mfa-spa-challenges.interceptors", ["arq-spa-base", "mfa-spa-challenges.util", "mfa-spa-challenges.challenges", "mfa-spa-challenges.journeys"])
        .run(executar);

    executar.$inject = ["mfaInterceptorConector"];

    function executar(mfaInterceptorConector) {
        mfaInterceptorConector.init();
    }
})();
(function () {
    "use strict";

    angular.module("mfa-spa-challenges.interceptors").factory("mfaInterceptorConector", factory);

    factory.$inject = ["$q", "$injector", "sfConectorAPI", "mfaChallengesFactory", "mfaUtilService"];

    function factory($q, $injector, sfConectorAPI, mfaChallengesFactory, mfaUtilService) {

        let _fields;
        const FIELDS_MAP = [
            { response: "desafio", request: "desafio" },
            { response: "desafioAutorizacao", request: "respostaDesafioAutorizacao" }
        ];
        const STATUS_CODE_CHALLENGES = [423];
        const STATUS_CODE_RETRY = [424];
        const STATUS_CODE_BLOCK = [425];
        const BLOCK_PIX = { CODE: 422, MESSAGE: "PIX041" };

        const PRIORITY_CHALLENGES = {
            token: 99
        };

        var originalConector;

        return {
            init: init
        };

        function init() {
            originalConector = angular.copy(sfConectorAPI.executar);
            sfConectorAPI.executar = conector;
        }

        function conector(configuracao_, exibirLoader_, mensagem_) {
            var defer = $q.defer();
            originalConector(configuracao_, exibirLoader_, mensagem_)
                .then(defer.resolve)
                .catch(function (response_) {
                    interpretResponse(response_)
                        .then(function (challengeContent_) {
                            executeChallenges(configuracao_, challengeContent_)
                                .then(function (challengesAnswers_) {
                                    configuracao_ = appendjourneyResponse(configuracao_, challengesAnswers_);
                                    sfConectorAPI.executar(configuracao_, exibirLoader_, mensagem_)
                                        .then(defer.resolve)
                                        .catch(defer.reject);
                                })
                                .catch(defer.reject);
                        })
                        .catch(defer.reject);
                });
            return defer.promise;
        }

        function interpretResponse(response_) {
            var defer = $q.defer();
            if (isChallengeStatusCode(response_)) {
                getChallengeResponse(response_)
                    .then(defer.resolve)
                    .catch(defer.reject);
            } else if (isRetryStatusCode(response_)) {
                getChallengeResponse(response_)
                    .then(retryResponse => {
                        executeJourneyRetry(retryResponse)
                            .then(function () {
                                defer.resolve(retryResponse);
                            })
                            .catch(function () {
                                defer.reject(response_);
                            });
                    })
                    .catch(defer.reject);
            } else if (isBlockStatusCode(response_) || isBlockPix(response_)) {
                getBlockResponse(response_)
                    .then(blockResponse => {
                        executeJourneyBlock(blockResponse)
                            .then(function () {
                                defer.resolve(blockResponse);
                            })
                            .catch(function () {
                                defer.reject(response_);
                            });
                    })
                    .catch(defer.reject);
            } else {
                defer.reject(response_);
            }
            return defer.promise;
        }

        function getChallengeResponse(response_) {
            var defer = $q.defer();
            var challengesResponse;
            _fields = FIELDS_MAP.find(function (fields_) {
                challengesResponse = getObjectBase64(findParam(response_, fields_.response, getObjectBase64));
                return !!challengesResponse;
            });
            if (challengesResponse) {
                mfaUtilService.info("mfaInterceptorConector.getChallengeResponse",
                    `Response com statusCode válido e com campo de desafios: ${JSON.stringify(response_)}`);
                defer.resolve(challengesResponse);
            } else {
                mfaUtilService.info("mfaInterceptorConector.getChallengeResponse",
                    `Response com statusCode válido mas sem campo de desafios: ${JSON.stringify(response_)}`);
                defer.reject(challengesResponse);
            }
            return defer.promise;
        }

        function getBlockResponse(response_) {
            var defer = $q.defer();
            var blockResponse;
            _fields = FIELDS_MAP.find(function (fields_) {
                blockResponse = getObjectBase64(findParam(response_, fields_.response, getObjectBase64));
                return !!blockResponse;
            });
            if (blockResponse) {
                mfaUtilService.info("mfaInterceptorConector.getBlockResponse",
                    `Response com statusCode válido e com campo de detalhes do bloqueio: ${JSON.stringify(response_)}`);
                defer.resolve(blockResponse);
            } else {
                mfaUtilService.info("mfaInterceptorConector.getBlockResponse",
                    `Response com statusCode válido mas sem campo de detalhes do bloqueio: ${JSON.stringify(response_)}`);
                defer.resolve(blockResponse);
            }
            return defer.promise;
        }

        function executeChallenges(configRequest_, challengeContent_, index_, answers_) {
            var defer = $q.defer();
            try {
                challengeContent_.autenticacoes = challengesPriority(challengeContent_.autenticacoes);
                var challenges = challengeContent_.autenticacoes || [];
                var indexLimit = challenges.length - 1;
                if (index_ > indexLimit) {
                    defer.resolve(modelCompleteAnswer(challengeContent_, answers_));
                } else {
                    answers_ = answers_ || [];
                    index_ = index_ || 0;
                    var challengeName_ = challenges[index_].tipo;
                    var challengeData_ = Object.assign((challenges[index_].data || {}), { desafio: challengeName_ }, { configRequest: configRequest_ });
                    var challengeJourney = mfaChallengesFactory.get(challengeName_);
                    mfaUtilService.info("mfaInterceptorConector.executeChallenges",
                        `Iniciando execução desafio: ${challengeName_}`);
                    executeJourneyChallenge(challengeJourney, challengeData_)
                        .then(function (challengeResponse_) {
                            mfaUtilService.info("mfaInterceptorConector.executeChallenges",
                                `Finalizada execução desafio: ${challengeName_}`);
                            if (isValidChallengeResponse(challengeJourney, challengeResponse_)) {
                                answers_.push(modelChallengeAnswer(challengeName_, challengeResponse_));
                                executeChallenges(configRequest_, challengeContent_, ++index_, answers_)
                                    .then(defer.resolve)
                                    .catch(defer.reject);
                            }
                        }).catch(defer.reject);
                }
            } catch (e) {
                defer.reject();
            }
            return defer.promise;
        }

        function executeJourneyChallenge(challengeJourney_, challengeData_) {
            var defer = $q.defer();
            if (!$injector.has(challengeJourney_)) {
                mfaUtilService.erro("mfaInterceptorConector.executeJourneyChallenge",
                    "Jornada \"" + challengeJourney_ + "\" não pode ser iniciada.");
            }
            var journey = $injector.get(challengeJourney_);
            if (!journey.dismissLoader || typeof journey.dismissLoader !== "function") {
                mfaUtilService.erro("mfaInterceptorConector.executeJourneyChallenge",
                    "Jornada \"" + challengeJourney_ + "\" não possui o metodo \"dismissLoader\" implementado.");
            } else if (!journey.init || typeof journey.init !== "function") {
                mfaUtilService.erro("mfaInterceptorConector.executeJourneyChallenge",
                    "Jornada \"" + challengeJourney_ + "\" não possui o metodo \"init\" implementado.");
            }
            journey.dismissLoader();
            journey.init(defer.resolve, defer.reject, challengeData_);
            return defer.promise;
        }

        function executeJourneyRetry({ listaDesafios }) {
            // TODO Trata challengeContent_ para obter e repassar o que foi errado para o canal
            var retryJourney = mfaChallengesFactory.get("retry");
            mfaUtilService.info("mfaInterceptorConector.executeJourneyRetry",
                `Iniciando execução da jornada de retry: ${retryJourney}`);
            return executeJourneyChallenge(retryJourney, { listaDesafios });
        }

        function executeJourneyBlock({ listaDesafios }) {
            // TODO Trata challengeContent_ para obter e repassar o que foi bloqueado para o canal
            var retryJourney = mfaChallengesFactory.get("block");
            mfaUtilService.info("mfaInterceptorConector.executeJourneyBlock",
                `Iniciando execução da jornada de block: ${retryJourney}`);
            return executeJourneyChallenge(retryJourney, { listaDesafios });
        }

        function isValidChallengeResponse(challengeJourney_, journeyResponse_) {
            if (!journeyResponse_ || typeof journeyResponse_ !== "object") {
                mfaUtilService.erro("mfaInterceptorConector.isValidChallengeResponse",
                    "Jornada \"" + challengeJourney_ + "\"  deve retornar um objeto.");
            }
            return true;
        }

        function modelChallengeAnswer(challengeName_, challengeAnswer_) {
            return {
                tipo: challengeName_,
                data: challengeAnswer_
            };
        }

        function modelCompleteAnswer(challengeContent_, challengeAnswers_) {
            var completeAnswer = Object.assign(challengeContent_, { autenticacoes: challengeAnswers_ });
            mfaUtilService.info("mfaInterceptorConector.modelCompleteAnswer",
                `Resposta dos desafios: ${JSON.stringify(completeAnswer)}`);
            return completeAnswer;
        }

        function appendjourneyResponse(configuracaoConector_, challengesAnswer_) {
            if (configuracaoConector_ && configuracaoConector_.data && typeof configuracaoConector_.data === "object") {
                var encodedAnswer = setObjectBase64(challengesAnswer_);
                configuracaoConector_.data[_fields.request] = encodedAnswer;
            }
            return configuracaoConector_;
        }

        function isChallengeStatusCode(response_) {
            var statusProcessamento = findParam(response_, "statusProcessamento");
            var statusCode = statusProcessamento && !isNaN(statusProcessamento.code) && parseInt(statusProcessamento.code);
            var isChallengeStatusCode = (STATUS_CODE_CHALLENGES.indexOf(statusCode) > -1);
            return isChallengeStatusCode;
        }

        function isRetryStatusCode(response_) {
            var statusProcessamento = findParam(response_, "statusProcessamento");
            var statusCode = statusProcessamento && !isNaN(statusProcessamento.code) && parseInt(statusProcessamento.code);
            var isRetryStatusCode = (STATUS_CODE_RETRY.indexOf(statusCode) > -1);
            return isRetryStatusCode;
        }

        function isBlockStatusCode(response_) {
            var statusProcessamento = findParam(response_, "statusProcessamento");
            var statusCode = statusProcessamento && !isNaN(statusProcessamento.code) && parseInt(statusProcessamento.code);
            var isBlockStatusCode = (STATUS_CODE_BLOCK.indexOf(statusCode) > -1);
            return isBlockStatusCode;
        }

        function isBlockPix(response_) {
            var statusProcessamento = findParam(response_, "statusProcessamento");
            var statusCode = statusProcessamento && !isNaN(statusProcessamento.code) && parseInt(statusProcessamento.code);
            var message = statusProcessamento && statusProcessamento.message;
            var isBlockStatusCode = (statusCode === BLOCK_PIX.CODE);
            var isBlockMessageCode = message && typeof message === "string" && (message.indexOf(BLOCK_PIX.MESSAGE) > -1);
            return isBlockStatusCode && isBlockMessageCode;
        }

        function findParam(object, key, predicate) {
            var value;
            Object.keys(object)
                .some(function (k) {
                    if (k === key && (!predicate || predicate(object[k]))) {
                        return (value = object[k]);
                    } else if (tryParseObject(object[k])) {
                        return (value = findParam(tryParseObject(object[k]), key, predicate));
                    } else if (object[k] && typeof object[k] === "object") {
                        return (value = findParam(object[k], key, predicate));
                    }
                    return value;
                });
            return value;
        }

        function tryParseObject(str) {
            try {
                return JSON.parse(str);
            } catch (e) {
                return null;
            }
        }

        function getObjectBase64(str) {
            try {
                return JSON.parse(window.atob(str));
            } catch (e) {
                return false;
            }
        }

        function setObjectBase64(obj) {
            return window.btoa(JSON.stringify(obj));
        }

        function challengesPriority(challenges_) {
            if (challenges_ && Array.isArray(challenges_)) {
                challenges_ = challenges_.sort(function (a, b) {
                    return (PRIORITY_CHALLENGES[a.tipo] || 0) - (PRIORITY_CHALLENGES[b.tipo] || 0);
                });
            }
            return challenges_;
        }
    }
})();
(function () {
    "use strict";
    angular.module("mfa-spa-challenges.journeys", ["arq-spa-base", "mfa-spa-challenges.challenges"]);
})();
(function () {
    "use strict";

    angular.module("mfa-spa-challenges.journeys").service("mfaFacematch", service);

    service.$inject = ["sfConectorAPI", "sfUtilitarios", "sfUrlContainer"];

    function service(sfConectorAPI, sfUtilitarios, sfUrlContainer) {
        return {
            init: init,
            dismissLoader: dismissLoader
        };

        function dismissLoader() {
            return;
        }

        function init(resolve_, reject_, data_) {
            var payload = data_ ? angular.copy(data_) : {};
            payload.appKey = payload.appkey ? payload.appkey : payload.appKey; // Defensiva caso serviço retorne com "K" em minusculo
            delete payload.appkey; // Evitar confusão em eventual analise, o que o container espera possui "K" maiusculo
            delete payload.configRequest;

            var url = sfUtilitarios.combinarCaminhos([sfUrlContainer.obter(), "liveness3d"]);
            var configHttp = {
                method: "POST",
                data: payload,
                url: url
            };
            sfConectorAPI.executar(configHttp)
                .then(function (res) {
                    var data = (typeof res === "object" && typeof res.data === "object") ? res.data : { data: res };
                    if (!data.sucesso || data.erro) { // Defensiva pois o container devolve statusCode 200 em alguns cenarios de erro da lib
                        reject_(res);
                    } else {
                        payload = (typeof payload === "object") ? payload : {};
                        resolve_(Object.assign(data, payload));
                    }
                })
                .catch(reject_);
        }
    }
})();
(function () {
    "use strict";
    angular.module("mfa-spa-challenges.util", ["arq-spa-base"]);
})();
(function () {
    "use strict";

    angular.module("mfa-spa-challenges.util").service("mfaUtilService", service);

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
                sfLogger.escreverLogExecucao(msg_, function_, fluxo, estado, "info", { classe: "mfa-spa-challenges", metodo: function_ });
                $log.info(msg_);
            }, 1);
        }

        function erro(function_, msg_, extra_) {
            $timeout(function () {
                msg_ = msg_ + parseExtra(extra_);
                sfLogger.escreverLogErro(msg_, null, "Alta", { classe: "mfa-spa-challenges", metodo: function_ });
                $log.error(msg_);
            }, 1);
        }

        function parseExtra(extra_) {
            return (extra_ && typeof extra_ === "object") ? JSON.stringify(extra_) : (extra_ !== undefined ? extra_ : "");
        }
    }
})();