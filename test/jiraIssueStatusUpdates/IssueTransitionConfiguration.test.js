
var testTransitionResponses = require('./mockIssueTransitionData.js');

test("Storages and access to transition info", () => {
    const IssueTransitionConfiguration = require('../../src/jiraIssueStatusUpdates/IssueTransitionConfiguration.gs');

    var config = new IssueTransitionConfiguration();
    expect(config.hasTransitionIds("PB-22","Testing")).toBe(false);
    expect(config.hasTransitionIds("PB-22","Invalid")).toBe(false);
    expect(config.hasTransitionIds("AB-22","Testing")).toBe(false);
    expect(config.hasTransitionIds("AB-22","Invalid")).toBe(false);

    config.setTransitions("PB-1","Testing",testTransitionResponses.threeStatuses);

    expect(config.hasTransitionIds("PB-22","Testing")).toBe(true);
    expect(config.hasTransitionIds("P-22","Testing")).toBe(false);
    expect(config.hasTransitionIds("PA-22","Testing")).toBe(false);
    expect(config.hasTransitionIds("AB-22","Testing")).toBe(false);
    expect(config.hasTransitionIds("AB-22","Testing")).toBe(false);
    expect(config.getTransitionId("PB-23","Testing","Done")).toBe("31");
    expect(config.getTransitionId("PB-24","Testing","In Progress")).toBe("21");
    expect(config.getTransitionId("PB-25","Testing","To Do")).toBe("11");
    expect(config.getTransitionId("PB-25","Testing","DOES NOT EXIST")).toBeNull();

    expect(config.hasTransitionIds("PB-26","Invalid")).toBe(false);
    expect(config.hasTransitionIds("AB-22","Invalid")).toBe(false);
    expect(config.getTransitionId("PB-27","Invalid","Done")).toBeNull();
    expect(config.getTransitionId("PB-28","Invalid","In Progress")).toBeNull();
    expect(config.getTransitionId("PB-29","Invalid","To Do")).toBeNull();


    config.setTransitions("PB-5","Invalid",testTransitionResponses.threeStatuses);


    expect(config.hasTransitionIds("PB-22","Testing")).toBe(true);
    expect(config.hasTransitionIds("PB-22","TESTING")).toBe(true);
    expect(config.hasTransitionIds("AB-22","Testing")).toBe(false);
    expect(config.getTransitionId("PB-23","Testing","Done")).toBe("31");
    expect(config.getTransitionId("PB-23","Testing","done")).toBe("31");
    expect(config.getTransitionId("PB-24","Testing","In Progress")).toBe("21");
    expect(config.getTransitionId("PB-25","Testing","To Do")).toBe("11");
    expect(config.getTransitionId("PB-25","Testing","TO DO")).toBe("11");
    expect(config.getTransitionId("PB-25","Testing","DOES NOT EXIST")).toBeNull();

    expect(config.hasTransitionIds("PB-26","Invalid")).toBe(true);
    expect(config.hasTransitionIds("AB-22","Invalid")).toBe(false);
    expect(config.getTransitionId("PB-27","Invalid","Done")).toBe("31");
    expect(config.getTransitionId("PB-28","Invalid","In Progress")).toBe("21");
    expect(config.getTransitionId("PB-29","Invalid","To Do")).toBe("11");
    expect(config.getTransitionId("PB-25","Invalid","DOES NOT EXIST")).toBeNull();

    // a completely seperate set of transition responses
    config.setTransitions("AB-999","Invalid",testTransitionResponses.twoStatuses);


    expect(config.hasTransitionIds("PB-22","Testing")).toBe(true);
    expect(config.hasTransitionIds("AB-22","Testing")).toBe(false);
    expect(config.getTransitionId("PB-23","Testing","Done")).toBe("31");
    expect(config.getTransitionId("PB-24","Testing","In Progress")).toBe("21");
    expect(config.getTransitionId("PB-25","Testing","To Do")).toBe("11");


    expect(config.hasTransitionIds("PB-26","Invalid")).toBe(true);
    expect(config.hasTransitionIds("AB-22","Invalid")).toBe(true);
    expect(config.getTransitionId("PB-27","Invalid","Done")).toBe("31");
    expect(config.getTransitionId("PB-28","Invalid","In Progress")).toBe("21");
    expect(config.getTransitionId("PB-29","Invalid","To Do")).toBe("11");
    expect(config.getTransitionId("AB-28","Invalid","In Progress")).toBe("61");
    expect(config.getTransitionId("AB-29","Invalid","To Do")).toBe("51");
    expect(config.getTransitionId("AB-27","Invalid","Done")).toBeNull();


    // overwriting a configuration
    config.setTransitions("PB-222","Invalid",testTransitionResponses.twoStatuses);
    expect(config.getTransitionId("PB-27","Invalid","Done")).toBeNull();
    expect(config.getTransitionId("PB-28","Invalid","In Progress")).toBe("61");
    expect(config.getTransitionId("PB-29","Invalid","To Do")).toBe("51");
    expect(config.getTransitionId("PB-25","Invalid","DOES NOT EXIST")).toBeNull();

});
