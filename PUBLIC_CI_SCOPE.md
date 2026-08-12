# Temporary public G01 integration CI scope

This repository is a disposable, source-only CI mirror for validating the
unsigned iOS simulator build and non-production Web/Mobile quality checks for
the SoliSola G01 foundation based on Audius apps commit
`57144304c433abdd344c0d07c37c26c31c71da9b`.

It intentionally contains a new Git history and excludes the private SoliSola
project plan, prompts, evidence, Android build/configuration files and signing
fixtures, private configuration, production credentials, deployment jobs, and
store publishing steps. Two source-equivalent upstream Kotlin application
files (one trailing-whitespace line normalized) are included only so the
repository-wide hardcoded-copy scanner can evaluate
its complete native source scope. It otherwise contains only the G01
non-sensitive product/build inputs needed to compile brand, design-token,
localization, navigation, feature-policy, and offline Settings changes. The
sole workflow is manual, read-only, unsigned, and uploads only build/test logs.

This mirror is not a product release, fork-of-record, deployment source, or
replacement for the private `SoliSolaMusic` repository. Its Actions run URL,
tested commit, and relevant hashes are copied back to private Gate evidence.
G01 screenshot specimens and private evidence are not copied here.
