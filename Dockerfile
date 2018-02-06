FROM ruby:2.5.0-stretch

RUN apt-get update && apt-get install -y \
        rsync \
		cmake \
		libopencv-dev \
		&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p /dungeon_assets/
RUN mkdir -p /dungeon/
COPY Gemfile /dungeon/
COPY Gemfile.lock /dungeon/
RUN cd /dungeon && bundle install

COPY . /dungeon
WORKDIR /dungeon
ENV RAILS_ENV docker

RUN chmod a+x /dungeon/docker/web_boot.sh
RUN bundle exec rake compile
RUN env RAILS_ENV=production bundle exec rake assets:clobber assets:precompile

EXPOSE 3000
VOLUME /dungeon_assets
CMD ["/dungeon/docker/web_boot.sh"]
