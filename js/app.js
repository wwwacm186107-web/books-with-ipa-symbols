(function () {
  const $ = (id) => document.getElementById(id);
  const landing = $("landing"),
    reader = $("reader");
  const stories = window.STORIES,
    P = window.Progress;
  const st = { nav: "all", view: "shelves", letter: "All", q: "" };
  const SHELVES = [
    {
      id: "reading",
      title: "Currently reading",
      sub: "Stories you've started",
    },
    { id: "next", title: "Next up", sub: "Stories waiting for you" },
    { id: "finished", title: "Finished", sub: "Stories you've completed" },
  ];

  function info(s) {
    const p = P.get(s.id);
    if (p && p.completed) return { shelf: "finished", pct: 100 };
    if (p)
      return {
        shelf: "reading",
        pct: Math.round(((p.page + 1) / Math.max(s.pages.length, 1)) * 100),
      };
    return { shelf: "next", pct: 0 };
  }

  // Library-style sorting: ignore a leading "The", "A" or "An"
  const sortTitle = (s) => s.title.replace(/^(the|a|an)\s+/i, "");
  function visible() {
    const q = st.q.trim().toLowerCase();
    const real = stories
      .filter(
        (s) =>
          !s.upcoming &&
          (st.nav === "all" || info(s).shelf === "reading") &&
          (st.letter === "All" ||
            sortTitle(s)[0].toUpperCase() === st.letter) &&
          (!q ||
            s.title.toLowerCase().includes(q) ||
            s.author.toLowerCase().includes(q)),
      )
      .sort((a, b) => sortTitle(a).localeCompare(sortTitle(b)));
    const soon =
      st.nav === "all" && st.letter === "All" && !q
        ? stories.filter((s) => s.upcoming)
        : [];
    return real.concat(soon);
  }

  function bookButton(s) {
    const b = h("button", { class: "book-stage", type: "button" }, [
      h("span", { class: "book-3d" }, [
        h("span", { class: "book-front" }, [
          h("img", {
            src: s.cover,
            alt: s.upcoming
              ? "Placeholder for upcoming stories"
              : s.title + " by " + s.author,
            width: 158,
            height: 230,
          }),
        ]),
        h("span", { class: "book-pages" }),
      ]),
    ]);
    b.addEventListener("click", () => openStory(s));
    return b;
  }

  function openStory(s) {
    if (s.upcoming) {
      $("msg").textContent = "More stories are coming soon.";
      return;
    }
    if (!s.pages.length) {
      $("msg").textContent =
        "“" +
        s.title +
        "” can't be opened yet: its text hasn't been added. Add its pages in js/stories.js.";
      return;
    }
    location.hash = "#read/" + s.id;
  }

  function render() {
    $("msg").textContent = "";
    $("count-all").textContent = stories.filter((s) => !s.upcoming).length;
    $("count-reading").textContent = stories.filter(
      (s) => info(s).shelf === "reading",
    ).length;
    document
      .querySelectorAll(".pill")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.nav === st.nav)),
      );
    document
      .querySelectorAll(".seg button")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.view === st.view)),
      );
    $("az-btn").textContent =
      st.letter === "All" ? "Sort A–Z" : "Sort A–Z · " + st.letter;
    document
      .querySelectorAll(".az-bar button")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String((b.dataset.l || "All") === st.letter),
        ),
      );

    const list = visible(),
      box = $("shelves");
    box.replaceChildren();
    $("empty").hidden = list.length > 0;
    $("empty").textContent =
      st.nav === "reading" && !st.q && st.letter === "All"
        ? "Nothing in progress yet. Open a story and it will appear here."
        : "No stories match.";
    if (!list.length) return;

    if (st.view === "grid") {
      box.appendChild(
        h(
          "div",
          { class: "grid-books" },
          list.map((s) =>
            h("div", { style: "text-align:center" }, [
              bookButton(s),
              h("p", {
                text: s.title,
                style: "font-weight:600;margin-top:12px;font-size:.9rem",
              }),
              h("p", {
                text: s.author,
                style: "font-size:.8rem;color:var(--ink-soft)",
              }),
            ]),
          ),
        ),
      );
      return;
    }
    const cols = window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 5;
    SHELVES.forEach((sh) => {
      if (st.nav === "reading" && sh.id !== "reading") return;
      const books = list.filter((s) => info(s).shelf === sh.id);
      if (!books.length) return;
      const sec = h("section", {}, [
        h("div", { class: "shelf-head" }, [
          h("h2", { text: sh.title }),
          h("p", { text: sh.sub }),
        ]),
      ]);
      for (let i = 0; i < books.length; i += cols) {
        const row = books.slice(i, i + cols),
          style = "--cols:" + cols;
        sec.appendChild(
          h("div", { class: "row" }, [
            h(
              "div",
              { class: "row-books", style },
              row.map((s) => h("div", { class: "cell" }, [bookButton(s)])),
            ),
            h("div", { class: "ledge", "aria-hidden": "true" }, [
              h(
                "div",
                { class: "row-track", style },
                row.map((s) => {
                  const pct = info(s).pct;
                  return h("div", { class: "cell" }, [
                    pct > 0 && pct < 100
                      ? h("div", { class: "track" }, [
                          h("i", { style: "width:" + pct + "%" }),
                        ])
                      : h("div", { class: "track none" }),
                  ]);
                }),
              ),
            ]),
          ]),
        );
      }
      box.appendChild(sec);
    });
  }

  // A–Z bar: letters with no titles are disabled
  const bar = $("az-bar"),
    initials = new Set(
      stories
        .filter((s) => !s.upcoming)
        .map((s) => sortTitle(s)[0].toUpperCase()),
    );
  const allBtn = h("button", { class: "all", type: "button", text: "All" });
  allBtn.addEventListener("click", () => {
    st.letter = "All";
    render();
  });
  bar.appendChild(allBtn);
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((l) => {
    const b = h("button", {
      type: "button",
      "data-l": l,
      text: l,
      "aria-label": "Titles starting with " + l,
    });
    if (!initials.has(l)) b.disabled = true;
    b.addEventListener("click", () => {
      st.letter = l;
      render();
    });
    bar.appendChild(b);
  });
  $("az-btn").addEventListener("click", () => {
    const open = bar.hidden;
    bar.hidden = !open;
    $("az-btn").setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".pill").forEach((b) =>
    b.addEventListener("click", () => {
      st.nav = b.dataset.nav;
      render();
    }),
  );
  document.querySelectorAll(".seg button").forEach((b) =>
    b.addEventListener("click", () => {
      st.view = b.dataset.view;
      render();
    }),
  );
  $("search").addEventListener("input", (e) => {
    st.q = e.target.value;
    render();
  });

  Object.entries(window.PHONETIC_CATEGORIES).forEach(([k, c]) =>
    $("legend").appendChild(
      h("li", {}, [
        h("span", { class: "sym cat-" + k, text: c.example.split(" ")[0] }),
        h("span", { class: "name", text: c.label }),
        h("span", { class: "ex", text: c.example, style: "color:" + c.color }),
      ]),
    ),
  );

  function route() {
    const m = location.hash.match(/^#read\/(.+)$/);
    const s = m && stories.find((x) => x.id === m[1] && x.pages.length);
    if (s) {
      const p = P.get(s.id);
      landing.hidden = true;
      reader.hidden = false;
      window.scrollTo(0, 0);
      window.Reader.open(s, p && !p.completed ? p.page : 0, () => {
        location.hash = "#library";
      });
    } else {
      reader.hidden = true;
      landing.hidden = false;
      render();
    }
  }
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (!landing.hidden && st.view === "shelves") render();
    }, 180);
  });
  window.Reader.init();
  window.addEventListener("hashchange", route);
  route();
})();
