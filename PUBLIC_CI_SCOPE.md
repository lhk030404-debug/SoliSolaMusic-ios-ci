# Temporary public G01 integration CI scope

This repository is a disposable, source-only CI mirror for validating the
unsigned iOS simulator and Android debug builds plus non-production Web/Mobile quality checks for
the SoliSola G01 foundation based on Audius apps commit
`57144304c433abdd344c0d07c37c26c31c71da9b`.

It intentionally contains a new Git history and excludes the private SoliSola
project plan, prompts, evidence, release/debug keystores, Google Services
configuration, embedded FFmpeg AAR, private configuration, production
credentials, deployment jobs, and store publishing steps. The Android debug
job generates a disposable debug key and verifies the downloaded inherited
FFmpeg AAR against the Gate 00 SHA-256 before compiling; neither is committed
or uploaded. It otherwise contains only the G01
non-sensitive product/build inputs needed to compile brand, design-token,
localization, navigation, feature-policy, and offline Settings changes. The
redacted Gate 00 third-party notice is included because the offline Licenses
regression verifies the shipped snapshot against that exact audited source.
The sole workflow is manual, read-only, non-production, and uploads only
build/test logs and the bundle-delta JSON.

This mirror is not a product release, fork-of-record, deployment source, or
replacement for the private `SoliSolaMusic` repository. Its Actions run URL,
tested commit, and relevant hashes are copied back to private Gate evidence.
G01 screenshot specimens and private evidence are not copied here.
