var threeStatuses = [
    {
        "id": "11",
        "name": "To Do",
        "to": {
            "description": "",
            "name": "To Do",
            "id": "10013"
        }
    },
    {
        "id": "21",
        "name": "In Progress",
        "to": {
            "description": "This issue is being actively worked on at the moment by the assignee.",
            "name": "In Progress",
            "id": "3"
        }
    },
    {
        "id": "31",
        "name": "Done",
        "to": {
            "description": "",
            "name": "Done",
            "id": "10012"
        }
    }
];

var twoStatuses = [
    {
        "id": "51",
        "name": "To Do",
        "to": {
            "description": "",
            "name": "To Do",
            "id": "10013"
        }
    },
    {
        "id": "61",
        "name": "In Progress",
        "to": {
            "description": "This issue is being actively worked on at the moment by the assignee.",
            "name": "In Progress",
            "id": "3"
        }
    }
];

module.exports  = {threeStatuses:threeStatuses,twoStatuses:twoStatuses};