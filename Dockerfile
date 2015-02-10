FROM danelbert/docker-ruby:latest

RUN apt-get update && apt-get install -y \
		cmake \
		libopencv-dev

RUN mkdir -p /etc/service/dungeon
COPY docker_run_script.sh /etc/service/dungeon/run
RUN chmod +x /etc/service/dungeon/run
EXPOSE 3000

RUN mkdir /dungeon
COPY Gemfile /dungeon/
COPY Gemfile.lock /dungeon/
RUN cd /dungeon && bundle install

COPY . /dungeon
WORKDIR /dungeon
ENV RAILS_ENV docker

RUN bundle exec rake compile
RUN bundle exec rake assets:clobber assets:precompile
