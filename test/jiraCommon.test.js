
test("field validation", () => {
    var fieldList = [
        {
            key:        "summary",
            name:       "Summary",
            custom:     false,
            schemaType: 'string',
            supported:  true
        },
        {
            key:        "custom1234",
            name:       "My custom field",
            custom:     true,
            schemaType: 'datetime',
            supported:  true

        },
        {
            key:        "custom5678",
            name:       "My custom field 2",
            custom:     true,
            schemaType: 'datetime',
            supported:  true

        }
    ]

    const getMatchingJiraField = require("../src/jiraCommon.gs").getMatchingJiraField;
    
    var matchedField = getMatchingJiraField(fieldList,"Summary");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("summary");

    var matchedField = getMatchingJiraField(fieldList,"My custom field");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList,"An unrecognised field");
    expect(matchedField).toBeNull();


    var matchedField = getMatchingJiraField(fieldList,"custom1234");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList,"my CUStom field");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList,"my CUStom field ");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList," my CUStom field ");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    
});
