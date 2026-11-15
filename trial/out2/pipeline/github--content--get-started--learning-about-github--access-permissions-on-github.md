---
title: Access permissions on GitHub
redirect_from:
  - /articles/needs-to-be-written-what-can-the-different-types-of-org-team-permissions-do
  - /articles/what-are-the-different-types-of-team-permissions
  - /articles/what-are-the-different-access-permissions
  - /articles/access-permissions-on-github
  - /github/getting-started-with-github/access-permissions-on-github
  - /github/getting-started-with-github/learning-about-github/access-permissions-on-github
intro: 'With roles, you can control who has access to your accounts and resources and the level of access each person has.'
versions:
  fpt: '*'
  ghes: '*'
  ghec: '*'
shortTitle: Access permissions
category:
  - Explore GitHub plans and features
---
## {% data variables.product.github %}のアクセス権限について

{% data reusables.organizations.about-roles %}

ロールの仕組みは、アカウントの種類によって異なります。アカウントの詳細については、[AUTOTITLE](/get-started/learning-about-github/types-of-github-accounts)を参照してください。

## 個人アカウント

個人アカウントが所有するリポジトリには、_リポジトリオーナー_と_コラボレーター_という2つの権限レベルがあります。詳細については、[AUTOTITLE](/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)を参照してください。

## 組織アカウント

組織のメンバーには、_オーナー_{% ifversion fpt or ghec %}、_ビリングマネージャー_{% endif %}、または_メンバー_のロールを割り当てることができます。オーナーは組織に対する完全な管理者アクセス権を持ち{% ifversion fpt or ghec %}、ビリングマネージャーは請求設定を管理できます{% endif %}。メンバーは、その他のすべての人に対するデフォルトのロールです。チームを使用すると、複数のメンバーのアクセス権限を一度に管理できます。詳細については、以下を参照してください。
* [AUTOTITLE](/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
* [AUTOTITLE](/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
* [AUTOTITLE](/organizations/organizing-members-into-teams/about-teams)

## 企業アカウント

企業アカウントには、ユーザーの企業設定へのアクセスを定義するさまざまな事前定義済みロールがあります。また、独自のきめ細かなアクセス許可セットを定義するカスタム企業ロールを作成することもできます。

詳細については、{% ifversion fpt %}{% data variables.product.prodname_ghe_cloud %}ドキュメントの[AUTOTITLE](/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles){% else %}[AUTOTITLE](/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles){% endif %}を参照してください。

## 関連資料

* [AUTOTITLE](/get-started/learning-about-github/types-of-github-accounts)
