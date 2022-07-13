FROM ruby:3.1.2-bullseye

RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get update && apt-get dist-upgrade -y && apt-get install -y \
    rsync \
    cmake \
    libopencv-dev \
    libvips-dev \
    libvips-tools \
    nodejs \
    nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN gem update --system && gem install bundler
RUN corepack enable

RUN rm /etc/nginx/sites-enabled/default

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

COPY docker/nginx/dungeon.conf /etc/nginx/sites-enabled/

EXPOSE 80
CMD ["/dungeon/docker/web_boot.sh"]
