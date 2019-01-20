jiraApiImport = require('../../src/jiraApi.gs');
jest.mock('../../src/jiraApi.gs', () => jest.fn());

const jiraApiMock = {
    call: jest.fn(),
    withSuccessHandler: jest.fn(),
    withFailureHandler: jest.fn(),
    getResponse: jest.fn(),
    resetMocks: resetMockFunction,
    setNextJiraResponse: setNextJiraResponse,
    setAllResponsesSuccesfull: setAllResponsesSuccesfull,
    setAllResponsesFail: setAllResponsesFail,
    setResponseSequence: setResponseSequence
};

function initJiraApiMockMethods() {
    jiraApiMock.call.mockImplementation(() => {
        return jiraApiMock;
    });
    jiraApiMock.withSuccessHandler.mockImplementation(() => {
        return jiraApiMock;
    });
    jiraApiMock.withFailureHandler.mockImplementation(() => {
        return jiraApiMock;
    });
    jiraApiMock.getResponse.mockImplementation(() => {
        return {};
    });
}

function resetMockFunction() {
    jiraApiMock.call.mockReset();
    jiraApiMock.withSuccessHandler.mockReset();
    jiraApiMock.withFailureHandler.mockReset();
    jiraApiMock.getResponse.mockReset();
    initJiraApiMockMethods();
}

function setNextJiraResponse(httpStatusCode, expectedMethodCall, dataToReturn) {
    if (httpStatusCode == null) {
        httpStatusCode = 200;
    }
    jiraApiMock.call.mockImplementationOnce((method, params) => {
        expect(method).toBe(expectedMethodCall);
        return {
            call: jiraApiMock.call,
            withSuccessHandler: function (calback) {
                calback(dataToReturn, null, httpStatusCode);
                return jiraApiMock;
            },
            withFailureHandler: jiraApiMock.withFailureHandler
        }
    })
}

function setResponseSequence(sequenceArray) {
    var index = 0;
    var currentResponse = null;
    if (index < sequenceArray.length) {
        jiraApiMock.call.mockImplementation((method, params) => {
            if (index >= sequenceArray.length) {
                throw "setResponseSequence index=" + index + " which exceeds the number of items in the sequenceArray";
            }
            currentResponse = sequenceArray[index];
            index++;
            if (currentResponse.statusCode == null) {
                if (currentResponse.success) {
                    currentResponse.statusCode = 200;
                } else {
                    currentResponse.statusCode = 500;
                }
            }
            if (currentResponse.method == null) {
                currentResponse.method = "get;"
            }

            return jiraApiMock;
        });
        jiraApiMock.withSuccessHandler.mockImplementation(function (callback) {
            if (currentResponse.success) {
                callback(currentResponse.respData, null, currentResponse.statusCode);
            }
            return jiraApiMock;
        });

        jiraApiMock.withFailureHandler.mockImplementation(function (callback) {
            if (!currentResponse.success) {
                callback(currentResponse.respData, null, currentResponse.statusCode);
            }
            return jiraApiMock;
        });

        jiraApiMock.getResponse.mockImplementation(function () {
            return currentResponse;
        });
    }
}

function setAllResponsesSuccesfull(httpStatusCode, dummyDataToReturn) {
    if (httpStatusCode == null) {
        httpStatusCode = 200;
    }
    resetMockFunction();
    jiraApiMock.withSuccessHandler.mockImplementation(function (calback) {
        calback(dummyDataToReturn, null, httpStatusCode);
        return jiraApiMock;
    });
    jiraApiMock.getResponse.mockImplementation(() => {
        return { 'respData': dummyDataToReturn, 'httpResp': null, 'statusCode': httpStatusCode, 'method': 'get', success: true };
    });
}

function setAllResponsesFail(httpStatusCode, dummyDataToReturn) {
    if (httpStatusCode == null) {
        httpStatusCode = 500;
    }
    resetMockFunction();
    jiraApiMock.withFailureHandler.mockImplementation(function (calback) {
        calback(dummyDataToReturn, null, httpStatusCode);
        return jiraApiMock;
    });
    jiraApiMock.getResponse.mockImplementation(() => {
        return {
            'respData': dummyDataToReturn,
            'httpResp': null,
            'statusCode': httpStatusCode,
            'method': 'get',
            success: false
        };
    });
}

function mockJiraApiConstructor() {
    this.call = jiraApiMock.call;
    this.withSuccessHandler = jiraApiMock.withSuccessHandler;
    this.withFailureHandler = jiraApiMock.withFailureHandler;
    this.getResponse = jiraApiMock.getResponse;
}

initJiraApiMockMethods();
jiraApiImport.mockImplementation(mockJiraApiConstructor);

module.exports = jiraApiMock;
