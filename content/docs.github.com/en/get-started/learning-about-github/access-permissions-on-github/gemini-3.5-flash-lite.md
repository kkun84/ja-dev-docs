---
title: "GitHubでのアクセス権限"
redirect_from:
  - /articles/needs-to-be-written-what-can-the-different-types-of-org-team-permissions-do
  - /articles/what-are-the-different-types-of-team-permissions
  - /articles/what-are-the-different-access-permissions
  - /articles/access-permissions-on-github
  - /github/getting-started-with-github/access-permissions-on-github
  - /github/getting-started-with-github/learning-about-github/access-permissions-on-github
intro: "ロールを使用すると、アカウントやリソースへのアクセス権を持つユーザーと、各ユーザーのアクセスレベルを制御できます。"
versions:
  fpt: '*'
  ghes: '*'
  ghec: '*'
shortTitle: "アクセス権限"
category:
  - Explore GitHub plans and features
---

## GitHubにおけるアクセス権限について

リポジトリでのpull requestの作成や組織の請求設定の変更など、GitHubで何らかのアクションを実行するには、関連するアカウントまたはリソースに対する十分なアクセス権が必要です。このアクセス権は、権限によって制御されます。権限とは、特定のアクションを実行する機能のことです。たとえば、issueを削除する機能は権限の1つです。ロールとは、個人やチームに割り当てることができる一連の権限のことです。

ロールの仕組みは、アカウントの種類によって異なります。アカウントの詳細については、「[Types of GitHub accounts](/get-started/learning-about-github/types-of-github-accounts)」を参照してください。

## 個人アカウント

個人アカウントが所有するリポジトリには、_リポジトリ所有者_と_コラボレーター_という2つの権限レベルがあります。詳細については、「[Permission levels for a personal account repository](/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)」を参照してください。

## 組織アカウント

組織のメンバーには、_所有者_、_請求マネージャー_、または_メンバー_のロールを割り当てることができます。所有者は組織に対する完全な管理アクセス権を持ち、請求マネージャーは請求設定を管理できます。メンバーは、その他のすべての人に対するデフォルトのロールです。チームを使用すると、複数のメンバーのアクセス権限を一度に管理できます。詳細については、次を参照してください。
* [Roles in an organization](/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
* [Repository roles for an organization](/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
* [About organization teams](/organizations/organizing-members-into-teams/about-teams)

## エンタープライズアカウント

エンタープライズアカウントには、エンタープライズ設定へのユーザーのアクセスを定義する事前定義された一連のロールがあります。また、カスタムのエンタープライズロールを作成して、独自の細かい権限セットを定義することもできます。

詳細については、GitHub Enterprise Cloudのドキュメントの「[AUTOTITLE](/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles)」を参照してください。

## 参考資料

* [Types of GitHub accounts](/get-started/learning-about-github/types-of-github-accounts)
