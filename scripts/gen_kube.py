from yaml import dump
from sys import argv
import re

def formatDeploymentData(service_name: str):
    return {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {
            "name": f"{service_name}-deployment",
            "labels": {
                "app": f"{service_name}"
            }
        },
        "spec": {
            "selector": {
                "matchLabels": {
                    "app": f"{service_name}"
                }
            },
            "replicas": 2,
            "template": {
                "metadata": {
                    "labels": {
                        "app": f"{service_name}"
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name":f"{service_name}-container",
                            "image": f"weeturtle/{service_name}:latest",
                            "env": [
                                {"name": "PORT", "value": "3000"}
                            ],
                            "ports": [{"name": f"{service_name}-service", "containerPort": 3000}]
                        }
                    ]
                }
            }
        }
    }

def formatServiceData(service_name: str):
    return {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": f"{service_name}-service"
        },
        "spec": {
            "selector": {
                "app": f"{service_name}"
            },
            "ports": [
                {"name": "http", "port": 3000}
            ],
            "type": "ClusterIP"
        }
    }

def check_service_name(service_name: str) -> bool:
    # Have between 2 and 255 characters
    # Only contain lowercase letters, numbers, hyphens (-), and underscores (_)
    return (re.match(r'^[a-z][a-z0-9-]*$', service_name) is not None)

def main() -> None:
    # Ensure the script is run with a service name argument
    try:
        service_name = argv[1]
    except IndexError:
        print("No service name provided")
        return

    # Ensure the service name is valid for dockerhub and kubernetes standards
    if not check_service_name(service_name):
        print(f"Invalid service name: {service_name}")
        return

    # Generate and write the deployment configuration to a yaml file
    deploymentConfig = formatDeploymentData(service_name)
    with open(f"{service_name}_kube.yaml", 'w') as doc:
        dump(deploymentConfig, doc, default_flow_style=False, sort_keys=False)

    # Generate and write the service configuration to a yaml file
    serviceConfig = formatServiceData(service_name)
    with open(f"{service_name}_service.yaml", 'w') as doc:
        dump(serviceConfig, doc, default_flow_style=False, sort_keys=False)

if __name__ == "__main__":
    main()
