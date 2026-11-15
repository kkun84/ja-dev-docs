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

ロールの機能はアカウントの種類によって異なります。アカウントについて詳しくは、[AUTOTITLE](/get-started/learning-about-github/types-of-github-accounts)を参照してください。

## 個人アカウント

個人アカウントが所有するリポジトリには、_repository owner_と_collaborators_の2つの権限レベルがあります。詳しくは、[AUTOTITLE](/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)を参照してください。

## Organizationアカウント

Organizationのメンバーは、_owner_{% ifversion fpt or ghec %}、_billing manager_{% endif %}、または_member_のロールを持つことができます。ownerはOrganizationへの完全な管理者アクセス権を持ち{% ifversion fpt or ghec %}、billing managerは請求設定を管理できます{% endif %}。memberは、それ以外のすべてのユーザーのデフォルトのロールです。チームを使用すると、複数のメンバーのアクセス権限を一度に管理できます。詳しくは、以下を参照してください。
* [AUTOTITLE](/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
* [AUTOTITLE](/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
* [AUTOTITLE](/organizations/organizing-members-into-teams/about-teams)

## Enterpriseアカウント

Enterpriseアカウントには、Enterprise設定へのユーザーのアクセス権を定義するさまざまな事前定義ロールがあります。また、カスタムEnterpriseロールを作成して、独自のきめ細かな権限セットを定義することもできます。

詳しくは、{% ifversion fpt %}{% data variables.product.prodname_ghe_cloud %}ドキュメントの[AUTOTITLE](/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles){% else %}[AUTOTITLE](/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles){% endif %}を参照してください。

## 参考資料

* [AUTOTITLE](/get-started/learning-about-github/types-of-github-accounts)