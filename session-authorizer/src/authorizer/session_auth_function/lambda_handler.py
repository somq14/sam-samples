import json

sessions = [
    {"user_id": "user01", "session_id": "xxxx"},
    {"user_id": "user02", "session_id": "yyyy"},
]


def create_policy(user_id, effect, resource):
    return {
        "principalId": user_id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": resource,
                }
            ],
        },
    }


def lambda_handler(event, context):
    print(json.dumps(event))

    resource = event["methodArn"]

    if "headers" not in event:
        return create_policy(None, "deny", resource)

    if "Authorization" not in event["headers"]:
        return create_policy(None, "deny", resource)

    session_id = event["headers"]["Authorization"]
    if session_id is None:
        return create_policy(None, "deny", resource)

    session = None
    for s in sessions:
        if session_id == s["session_id"]:
            session = s

    if session is None:
        return create_policy(None, "deny", resource)

    return create_policy(session["user_id"], "allow", resource)
