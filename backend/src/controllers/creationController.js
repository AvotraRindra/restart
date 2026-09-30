const Memory =
  require("../models/Memory");

const Creation =
  require("../models/Creation");

const service =
  require("../services/creationService");

const imageGenerationService =
  require(
    "../services/imageGenerationService"
  );


/* =========================================================
   GÉNÉRER UNE CRÉATION
========================================================= */

exports.generate =
  async (
    req,
    res,
    next
  ) => {

  try {

    /* =====================================================
       CHERCHER LE SOUVENIR
    ===================================================== */

    const memory =
      await Memory.findById(
        req.params.id
      );


    if (!memory) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Souvenir introuvable.",
        });
    }


    /* =====================================================
       VÉRIFIER LE PROPRIÉTAIRE
    ===================================================== */

    if (
      Number(memory.owner_id) !==
      Number(req.user.id)
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Vous ne pouvez pas générer ce souvenir.",
        });
    }


    /* =====================================================
       LE SOUVENIR DOIT CONTENIR DU TEXTE
    ===================================================== */

    if (
      !memory.text_content
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Une transcription ou un texte est nécessaire avant la génération.",
        });
    }


    /* =====================================================
       STATUT
    ===================================================== */

    await Memory
      .setGenerationStatus(
        memory.id,
        "generating"
      );


    try {

      let result;

      const warnings = [];


      /* ===================================================
         LIVRE
      =================================================== */

      if (
        memory.memory_type ===
        "livre"
      ) {

        result =
          await service
            .generateBook(
              memory
            );


        await Creation
          .saveBook(
            memory.id,
            result.pages
          );
      }


      /* ===================================================
         VIDÉO
      =================================================== */

      else if (
        memory.memory_type ===
        "video"
      ) {

        const photos =
          await Memory.photos(
            memory.id
          );


        result =
          await service
            .generateVideo(
              memory,
              photos
            );


        await Creation
          .saveVideo(
            memory.id,
            result.scenes
          );
      }


      /* ===================================================
         BANDE DESSINÉE
      =================================================== */

      else {

        /* -----------------------------------------------
           Personnages avec leurs photos
        ----------------------------------------------- */

        const characters =
          await Memory
            .characters(
              memory.id
            );


        /* -----------------------------------------------
           Gemini texte crée :
           - narration
           - dialogue
           - image_prompt
        ----------------------------------------------- */

        result =
          await service
            .generateComic(
              memory,
              characters
            );


        /*
          On sauvegarde immédiatement la structure.

          Ainsi, si Gemini Image échoue,
          les textes de la BD ne sont pas perdus.
        */

        await Creation
          .saveComic(
            memory.id,
            result.panels
          );


        /* -----------------------------------------------
           Génération des vraies images
        ----------------------------------------------- */

        let generatedImages = 0;


        for (
          const panel
          of result.panels || []
        ) {

          try {

            /* ===========================================
               GEMINI IMAGE
            =========================================== */

            const imageUrl =
              await imageGenerationService
                .generateComicPanelImage({
                  memory,

                  panel,

                  characters,
                });


            /* ===========================================
               ENREGISTRER DANS MYSQL
            =========================================== */

            await Creation
              .updateComicPanelImage(
                memory.id,

                panel.panel_number,

                imageUrl
              );


            /*
              On ajoute également l'URL
              au résultat en mémoire.
            */

            panel.image_url =
              imageUrl;


            generatedImages++;

          } catch (
            imageError
          ) {

            const message =
              imageError?.message ||
              String(
                imageError
              );


            console.error(
              `Échec image BD mémoire ${memory.id}, ` +
              `case ${panel.panel_number}:`,
              message
            );


            warnings.push(
              `Case ${panel.panel_number}: ` +
              `l'image n'a pas pu être générée.`
            );
          }
        }


        /* -----------------------------------------------
           Aucune image n'a fonctionné
        ----------------------------------------------- */

        if (
          (result.panels || [])
            .length > 0 &&
          generatedImages === 0
        ) {

          warnings.push(
            "La structure de la bande dessinée a été créée, " +
            "mais aucune image n'a pu être générée."
          );
        }
      }


      /* ===================================================
         GÉNÉRATION TERMINÉE
      =================================================== */

      await Memory
        .setGenerationStatus(
          memory.id,

          "completed",

          result.title ||
          null
        );


      /* ===================================================
         RECHARGER DEPUIS MYSQL
      =================================================== */

      const freshMemory =
        await Memory
          .findById(
            memory.id
          );


      const storedCreation =
        await Creation
          .get(
            freshMemory
          );


      /* ===================================================
         RÉPONSE
      =================================================== */

      return res.json({
        success: true,

        message:
          warnings.length > 0
            ? "Création terminée avec certains avertissements."
            : "Création générée avec succès.",

        warnings,

        data: {
          type:
            memory.memory_type,

          title:
            result.title ||
            memory.title,

          creation:
            storedCreation,
        },
      });

    } catch (error) {

      /* ===================================================
         ÉCHEC DE GÉNÉRATION PRINCIPALE
      =================================================== */

      await Memory
        .setGenerationStatus(
          memory.id,
          "failed"
        );


      return res
        .status(502)
        .json({
          success: false,

          message:
            "Le souvenir est sauvegardé mais sa génération a échoué.",

          details:
            error?.message ||
            String(error),
        });
    }

  } catch (error) {

    next(error);
  }
};


/* =========================================================
   RÉCUPÉRER UNE CRÉATION
========================================================= */

exports.getCreation =
  async (
    req,
    res,
    next
  ) => {

  try {

    const memory =
      await Memory.findById(
        req.params.id
      );


    if (!memory) {

      return res
        .status(404)
        .json({
          success: false,

          message:
            "Souvenir introuvable.",
        });
    }


    /* =====================================================
       PRIVÉ / PUBLIC
    ===================================================== */

    if (
      Number(memory.owner_id) !==
        Number(req.user.id) &&

      memory.access_level !==
        "public"
    ) {

      return res
        .status(403)
        .json({
          success: false,

          message:
            "Accès refusé.",
        });
    }


    /* =====================================================
       DONNÉES COMPLÈTES
    ===================================================== */

    return res.json({
      success: true,

      data: {

        memory,

        photos:
          await Memory
            .photos(
              memory.id
            ),

        characters:
          memory.memory_type ===
          "bd"
            ? await Memory
                .characters(
                  memory.id
                )
            : [],

        attachments:
          await Memory
            .attachments(
              memory.id
            ),

        creation:
          await Creation
            .get(
              memory
            ),
      },
    });

  } catch (error) {

    next(error);
  }
};
