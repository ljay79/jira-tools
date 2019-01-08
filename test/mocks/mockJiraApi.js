
jirApiImport = require('../../src/jiraApi.gs');
jest.mock('../../src/jiraApi.gs',() => jest.fn());

const jiraApiMock = {
    call:jest.fn(),
    withSuccessHandler:jest.fn(),
    withFailureHandler:jest.fn(),
    resetMocks: resetMockFunction,
    setNextJiraResponse: setNextJiraResponse
};


function initJiraApiMockMethods() {
    jiraApiMock.call.mockImplementation(() =>{
        return jiraApiMock;
    } );
    jiraApiMock.withSuccessHandler.mockImplementation(() =>{
        return jiraApiMock;
    } );
    jiraApiMock.withFailureHandler.mockImplementation(() =>{
        return jiraApiMock;
    } );
}

function resetMockFunction() {
    initJiraApiMockMethods();
}

function setNextJiraResponse(expectedMethodCall,dataToReturn) {
    jiraApiMock.call.mockImplementationOnce((method,params) => {
        expect(method).toBe(expectedMethodCall);
        return {
            call:jiraApiMock.call,
            withSuccessHandler: function (calback) {
                calback(dataToReturn,null,200);
                return jiraApiMock;
            },
            withFailureHandler: jiraApiMock.withFailureHandler
        }
    })
}


function mockJiraApiConstructor() {
    this.call = jiraApiMock.call;
    this.withSuccessHandler = jiraApiMock.withSuccessHandler;
    this.withFailureHandler = jiraApiMock.withFailureHandler;
}

initJiraApiMockMethods();
jirApiImport.mockImplementation(mockJiraApiConstructor);

module.exports = jiraApiMock;
