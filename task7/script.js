(() => {
  // Model: загружает и хранит данные.
  class PostsModel {
    constructor() {
      this.posts = [];
      this.limit = 10;
      this.totalPosts = 100;
      this.isLoading = false;
      this.hasMore = true;
      this.searchText = "";
    }

    async loadNextPosts() {
      if (this.isLoading || !this.hasMore) return;

      this.isLoading = true;

      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts?_start=${this.posts.length}&_limit=${this.limit}`
        );

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const newPosts = await response.json();
        this.posts.push(...newPosts);

        if (newPosts.length < this.limit || this.posts.length >= this.totalPosts) {
          this.hasMore = false;
        }
      } catch (error) {
        throw new Error("Не удалось загрузить посты. Проверьте подключение к интернету.");
      } finally {
        this.isLoading = false;
      }
    }

    setSearchText(text) {
      this.searchText = text.trim().toLowerCase();
    }

    getFilteredPosts() {
      return this.posts.filter((post) =>
        post.title.toLowerCase().includes(this.searchText)
      );
    }
  }

  // View: создаёт карточки и показывает состояние загрузки.
  class PostsView {
    constructor(postsElement, statusElement, searchInput) {
      this.postsElement = postsElement;
      this.statusElement = statusElement;
      this.searchInput = searchInput;
    }

    createPostCard(post) {
      const card = document.createElement("article");
      const author = document.createElement("p");
      const title = document.createElement("h2");
      const body = document.createElement("p");

      card.className = "post";
      author.className = "post-meta";
      body.className = "post-body";

      author.textContent = `Автор: ${post.userId}`;
      title.textContent = post.title;
      body.textContent = post.body;


      card.append(author, title, body);
      return card;
    }

    renderPosts(posts) {
      this.postsElement.replaceChildren();

      if (posts.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "Среди загруженных постов ничего не найдено.";
        this.postsElement.append(message);
        return;
      }

      const fragment = document.createDocumentFragment();

      posts.forEach((post) => {
        fragment.append(this.createPostCard(post));
      });

      this.postsElement.append(fragment);
    }

    showLoading() {
      this.statusElement.className = "status loading";
      this.statusElement.textContent = "Загрузка…";
    }

    showError(message) {
      this.statusElement.className = "status error";
      this.statusElement.textContent = message;
    }

    showEnd() {
      this.statusElement.className = "status";
      this.statusElement.textContent = "Больше постов нет";
    }

    clearStatus() {
      this.statusElement.className = "status";
      this.statusElement.textContent = "";
    }
  }

  // Controller: связывает действия пользователя, модель и представление.
  class PostsController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
      this.searchTimer = null;

      this.handleScroll = this.handleScroll.bind(this);
      this.handleSearch = this.handleSearch.bind(this);

      window.addEventListener("scroll", this.handleScroll, { passive: true });
      this.view.searchInput.addEventListener("input", this.handleSearch);
      this.loadPosts();
    }

    async loadPosts() {
      if (this.model.isLoading || !this.model.hasMore) return;

      this.view.showLoading();

      try {
        await this.model.loadNextPosts();
        this.view.renderPosts(this.model.getFilteredPosts());

        if (this.model.hasMore) {
          this.view.clearStatus();
        } else {
          this.view.showEnd();
        }
      } catch (error) {
        this.view.showError(error.message);
      }
    }

    handleScroll() {
      const distanceToBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);

      if (distanceToBottom <= 200) {
        this.loadPosts();
      }
    }

    handleSearch(event) {
      clearTimeout(this.searchTimer);

      this.searchTimer = setTimeout(() => {
        this.model.setSearchText(event.target.value);
        this.view.renderPosts(this.model.getFilteredPosts());
      }, 300);
    }
  }

  const model = new PostsModel();
  const view = new PostsView(
    document.querySelector("#posts"),
    document.querySelector("#status"),
    document.querySelector("#search-input")
  );

  new PostsController(model, view);
})();
