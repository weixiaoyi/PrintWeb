import { createRouter, createWebHashHistory } from "vue-router";
import Layout from "@/layout";
import { asyncImport } from "@/utils/fn";

// 公共路由
// ----------------------------------------------------注意用asyncImport解决路由导入出错问题-------------------------------------------------------------------
export const constantRoutes = [
  {
    path: "/viewPrintPreview",
    name: "viewPrintPreview",
    component: asyncImport("../views/webPrint/printPreview/index"),
    meta: {
      title: "打印预览",
      icon: "#",
      noCache: false,
      link: null,
    },
  },
  {
    path: "/",
    component: Layout,
    hidden: true,
    redirect: "noRedirect",
    children: [
      {
        name: "webPrintHome",
        path: "/",
        hidden: false,
        component: asyncImport("../views/webPrint/home/index"),
        meta: {
          title: "首页",
          icon: "#",
          noCache: false,
          link: null,
        },
      },
      {
        name: "devTool",
        path: "/devTool",
        hidden: false,
        component: asyncImport("../views/devtool/index"),
        meta: {
          title: "开发者页面",
          icon: "#",
          noCache: false,
          link: null,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
});

export default router;
