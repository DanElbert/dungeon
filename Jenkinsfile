library('jenkins_build')

node {
    main {
        def dockerImageName = "registry.elbert.us/dungeon"
        def dockerImage

        stage("Checkout") {
            checkout scm
        }

        stage("Build") {
            dockerImage = docker.build("${dockerImageName}:latest")
        }

        stage("Publish") {
            dockerImage.push()
            dockerImage.push(env.JOB_BASE_NAME)
        }

        if (env.BRANCH_NAME == "production") {
            stage("Deploy") {
                deploy("dungeon", "./docker-compose-rlyeh.yml")
            }
        }
    }
}