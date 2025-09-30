import router from "./router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { message } from "ant-design-vue";

NProgress.configure({ showSpinner: false });

const _push = router.push;
const _replace = router.replace;
[
  {
    key: "push",
    value: _push,
  },
  {
    key: "replace",
    value: _replace,
  },
].forEach((item) => {
  router[item.key] = (params) => {
    const method = item.value;
    if (typeof params === "object") {
      let paramsNormalized = params.query;
      if (Object.keys(params?.query || {})?.length) {
        paramsNormalized = {
          _p: encodeURIComponent(JSON.stringify(params.query)),
        };
      }
      return method({
        ...params,
        query: paramsNormalized,
      });
    } else {
      return method(params);
    }
  };
});
router.beforeEach((to, from, next) => {
  if (to.query._p) {
    try {
      to.query = JSON.parse(decodeURIComponent(to.query._p));
    } catch (err) {
      message.warning("参数有误，请尝试点击浏览器后退，重新进入该页面！");
      throw new Error("参数有误");
    }
    console.log(to.query, "解析后的查询参数");
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});
