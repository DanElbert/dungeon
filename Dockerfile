FROM danelbert/docker-ruby:latest

RUN apt-get update && apt-get install -y \
		cmake \
		libopencv-dev

RUN mkdir -p /etc/my_init.d
COPY docker/docker_assets_script.sh /etc/my_init.d/
RUN chmod +x /etc/my_init.d/docker_assets_script.sh

RUN mkdir -p /etc/service/dungeon
COPY docker/docker_run_script.sh /etc/service/dungeon/run
RUN chmod +x /etc/service/dungeon/run

EXPOSE 3000

RUN mkdir -p /dungeon_assets/
RUN mkdir -p /dungeon
COPY Gemfile /dungeon/
COPY Gemfile.lock /dungeon/
RUN cd /dungeon && bundle install

COPY . /dungeon
WORKDIR /dungeon
ENV RAILS_ENV docker

RUN bundle exec rake compile
RUN bundle exec rake assets:precompile
