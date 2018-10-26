FROM ruby:2.5.1-stretch

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get update && apt-get install -y \
    rsync \
    cmake \
    libopencv-dev \
    libvips-dev \
    libvips-tools \
    nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN gem update --system && gem install bundler

COPY docker/image_magic_policy.xml /etc/ImageMagick-6/policy.xml

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
