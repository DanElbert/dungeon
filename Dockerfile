FROM ruby:2.5.1-stretch

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y \
    rsync \
    cmake \
    libopencv-dev \
    libvips-dev \
    libvips-tools \
    nodejs \
    yarn \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN gem update --system && gem install bundler

COPY docker/image_magic_policy.xml /etc/ImageMagick-6/policy.xml

RUN mkdir -p /dungeon_assets/
RUN mkdir -p /dungeon/
WORKDIR /dungeon
COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY package.json yarn.lock ./
RUN yarn install --production=true

COPY . /dungeon
ENV RAILS_ENV docker

RUN chmod a+x /dungeon/docker/web_boot.sh
RUN bundle exec rake compile
RUN env RAILS_ENV=production bundle exec rake assets:clobber assets:precompile

EXPOSE 3000
VOLUME /dungeon_assets
CMD ["/dungeon/docker/web_boot.sh"]
