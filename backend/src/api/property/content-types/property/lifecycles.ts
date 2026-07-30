const generateDescription = async (aiMetadata: any): Promise<string | null> => {
  strapi.log.info("OPENAI - description generation started");

  if (
    aiMetadata === null ||
    aiMetadata === undefined ||
    (typeof aiMetadata === "object" && Object.keys(aiMetadata).length === 0)
  ) {
    strapi.log.warn("OPENAI - ai_metadata is empty, skipping description generation");
    return null;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  strapi.log.info(`OPENAI - OPENAI_API_KEY present: ${Boolean(OPENAI_API_KEY)}`);
  if (!OPENAI_API_KEY) {
    strapi.log.warn("OPENAI - OPENAI_API_KEY is not configured, skipping description generation");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Você é um redator especializado em imóveis de alto padrão no Brasil. Receberá dados de inteligência visual de múltiplas fotos do mesmo imóvel — os dados podem incluir detecção de tipo de ambiente por imagem, resumo de características, resultados de legenda e sinais de condição e qualidade (c1c6 e q1q6). Trate os dados como um conjunto referente à propriedade inteira, não a uma única foto. Se múltiplos ambientes distintos forem detectados com confiança razoável (por exemplo, cozinha, quarto, sala de estar, banheiro), descreva os principais espaços de forma equilibrada, proporcional ao que os dados suportam — a menos que os dados indiquem apenas um ambiente, caso em que descreva somente esse espaço. Use resultados de legenda como suporte descritivo, mas reescreva sempre com suas próprias palavras; nunca copie uma legenda literalmente. Converta rótulos técnicos de características para português natural (por exemplo: stone_countertops → bancadas em pedra, floor_ceiling_windows → janelas do piso ao teto, wood_finish_floor → piso de madeira, kitchen_island → ilha de cozinha, recessed_lighting → iluminação embutida, hardwood_floor → assoalho de madeira, stainless_steel_appliances → eletrodomésticos em aço inox). Atenha-se estritamente ao que os dados suportam. NÃO invente localização, qualidade de bairro, metragem, detalhes de lote, ano de construção, escola, comodidades, eletrodomésticos, materiais, acabamentos, número de quartos ou banheiros, contagens de cômodos, afirmações sobre layout, vistas ou afirmações de estilo de vida não diretamente suportados pelos dados. Se os dados indicarem low_coverage ou que alguma imagem é renderizada ou virtualmente encenada, mantenha o tom conservador e evite afirmar condição, qualidade ou nível de acabamento elevados. Se os dados forem escassos ou superficiais, redija uma descrição conservadora e factual baseada apenas no que está claramente presente — sem simular inteligência mais profunda. Nunca mencione \"IA\", \"metadados\", \"Restb.ai\", \"confiança\", \"pontuação\", \"renderizado\", \"virtualmente encenado\", \"baixa cobertura\" ou qualquer referência a dados, análise ou fotos no texto final. Nunca se desculpe por informações ausentes — simplesmente omita o que não é suportado. Evite hipérboles como \"enclave de prestígio\", \"refúgio culinário\", \"de última geração\", \"impecável\", \"inigualável\" ou \"santuário de luxo\". Tom: premium, factual, contido, orientado a benefícios — adequado para o mercado imobiliário de alto padrão no Brasil. Saída: apenas texto corrido em Português do Brasil, sem markdown, 120–180 palavras.",
          },
          {
            role: "user",
            content: `Escreva uma descrição de anúncio imobiliário em Português do Brasil (120–180 palavras) para este imóvel, usando a inteligência visual multi-imagem abaixo:\n${JSON.stringify(aiMetadata, null, 2)}\n\nDescreva os principais ambientes detectados de forma proporcional ao que os dados suportam. Converta rótulos técnicos de características para português natural. Reescreva quaisquer legendas com suas próprias palavras. Mantenha-se estritamente dentro do que os dados mostram — não invente localização, contagem de cômodos, metragem, comodidades ou afirmações de estilo de vida. Se os dados forem escassos, seja conservador e factual. Texto corrido em Português do Brasil, sem markdown.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    strapi.log.info(`OPENAI - response status: ${response.status} ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      strapi.log.error(`OPENAI - API error (status ${response.status}): ${errorText}`);
      return null;
    }

    const data: any = await response.json();
    const description: string =
      data?.choices?.[0]?.message?.content?.trim() ||
      data?.output_text?.trim() ||
      "";

    strapi.log.info(`OPENAI - parsed description length: ${description.length}`);
    if (!description) {
      strapi.log.warn(`OPENAI - returned empty description. Raw choices: ${JSON.stringify(data?.choices ?? data)?.slice(0, 300)}`);
      return null;
    }

    strapi.log.info(`OPENAI - description preview: ${description.slice(0, 120)}`);
    return description;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      strapi.log.error("OPENAI - API timeout in lifecycle");
    } else {
      strapi.log.error(`OPENAI - lifecycle error: ${error.message}`);
    }
    return null;
  }
};

const callRestbAi = async (imageUrls: string[], propertyId: string): Promise<any> => {
  const RESTB_API_KEY = process.env.RESTB_API_KEY;
  if (!RESTB_API_KEY) {
    strapi.log.warn("RESTB_API_KEY is not configured, skipping AI enrichment");
    return null;
  }

  const url = `https://property.restb.ai/v1/multianalyze?client_key=${encodeURIComponent(RESTB_API_KEY)}`;
  const endpointForLog = "POST https://property.restb.ai/v1/multianalyze";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const payload = {
      image_urls: imageUrls,
      solutions: {
        c1c6: null,
        q1q6: null,
        roomtype: 1,
        features: 6,
        caption: null,
      },
    };
    const serializedBody = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(serializedBody);
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": contentLength.toString(),
      "X-Property-ID": propertyId,
      "X-Client-ID": "aurixa",
    };

    strapi.log.info(`RESTB.AI - ENDPOINT: ${endpointForLog}`);
    strapi.log.info(`RESTB.AI - PROPERTY ID: ${propertyId}`);
    strapi.log.info(`RESTB.AI - IMAGE COUNT: ${imageUrls.length}`);
    strapi.log.info(`RESTB.AI - IMAGE URLS: ${JSON.stringify(imageUrls)}`);
    strapi.log.info(`RESTB.AI - BODY: ${serializedBody}`);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: serializedBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    strapi.log.info(`RESTB.AI - RESPONSE STATUS: ${response.status}`);
    strapi.log.info(`RESTB.AI - RESPONSE OK: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      strapi.log.error(`Restb.ai API error in lifecycle: ${errorText}`);
      return null;
    }

    const data = await response.json();
    const topLevelKeys = data && typeof data === "object" ? Object.keys(data as any) : [];
    const hasResponseKey = Boolean(data && typeof data === "object" && "response" in (data as any));
    const rawPreview = JSON.stringify(data).slice(0, 1500);
    strapi.log.info(`RESTB.AI - TOP-LEVEL KEYS: ${JSON.stringify(topLevelKeys)}`);
    strapi.log.info(`RESTB.AI - HAS data.response: ${hasResponseKey}`);
    strapi.log.info(`RESTB.AI - RAW PREVIEW (<=1500 chars): ${rawPreview}`);

    if ((data as any)?.error === true) {
      const errMsg = (data as any)?.message ?? "(no message)";
      const errDetails = (data as any)?.error_details;
      strapi.log.error(
        `RESTB.AI - API returned error=true for property ${propertyId}: ${errMsg}`,
      );
      if (errDetails !== undefined) {
        strapi.log.error(
          `RESTB.AI - error_details: ${JSON.stringify(errDetails)}`,
        );
      }
      return null;
    }

    const restbData = (data as any)?.response ?? data ?? null;
    if (!restbData) {
      strapi.log.warn(`RESTB.AI - parsed restbData is null for property ${propertyId}`);
    }
    return restbData;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      strapi.log.error("Restb.ai API timeout in lifecycle");
    } else {
      strapi.log.error(`Restb.ai lifecycle error: ${error.message}`);
    }
    return null;
  }
};

const resolveImageUrls = (property: any): string[] => {
  if (
    !property.images ||
    !Array.isArray(property.images) ||
    property.images.length === 0
  ) {
    return [];
  }

  // Forces the full Staging URL so Restb.ai can actually find the uploaded image
  const baseUrl = process.env.RENDER_EXTERNAL_URL || "https://aurixa-strapi-staging.onrender.com";

  return property.images
    .map((img: any) => {
      if (!img || !img.url) return null;
      return img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`;
    })
    .filter((u: string | null): u is string => typeof u === "string" && u.length > 0);
};

export default {
  async afterCreate(event: any) {
    const { result } = event;

    const property = await strapi.documents("api::property.property").findOne({
      documentId: result.documentId,
      populate: ["images"],
    });

    if (!property) return;

    const imageUrls = resolveImageUrls(property);
    if (imageUrls.length === 0) {
      strapi.log.info(
        `Property ${result.documentId} created without images, skipping AI enrichment`,
      );
      return;
    }

    strapi.log.info(
      `Running AI enrichment for new property ${result.documentId} (${imageUrls.length} image(s))`,
    );

    const aiData = await callRestbAi(imageUrls, result.documentId);
    if (aiData) {
      const updateData: any = { ai_metadata: aiData };

      strapi.log.info(`Generating AI description for property ${result.documentId}`);
      const description = await generateDescription(aiData);
      if (description) {
        updateData.ai_description = description;
      } else {
        strapi.log.warn(`No ai_description generated for property ${result.documentId} (saving ai_metadata only)`);
      }

      strapi.log.info(`SAVE - property ${result.documentId} payload keys: ${Object.keys(updateData).join(", ")}`);

      const updated = await strapi.db.query("api::property.property").update({
        where: { id: result.id },
        data: updateData,
      });

      strapi.log.info(
        `SAVE - property ${result.documentId} confirmed. ai_metadata present: ${Boolean((updated as any)?.ai_metadata)}, ai_description length: ${((updated as any)?.ai_description || "").length}`,
      );
      strapi.log.info(
        `AI enrichment complete for property ${result.documentId}`,
      );
    }
  },

  async afterUpdate(event: any) {
    const { result, params } = event;

    if (params?.data?.ai_metadata !== undefined || params?.data?.ai_description !== undefined) {
      return;
    }

    const property = await strapi.documents("api::property.property").findOne({
      documentId: result.documentId,
      populate: ["images"],
    });

    if (!property) return;

    const imageUrls = resolveImageUrls(property);
    if (imageUrls.length === 0) {
      strapi.log.info(
        `Property ${result.documentId} updated without images, skipping AI enrichment`,
      );
      return;
    }

    strapi.log.info(
      `Running AI enrichment for updated property ${result.documentId} (${imageUrls.length} image(s))`,
    );

    const aiData = await callRestbAi(imageUrls, result.documentId);
    if (aiData) {
      const updateData: any = { ai_metadata: aiData };

      strapi.log.info(`Generating AI description for updated property ${result.documentId}`);
      const description = await generateDescription(aiData);
      if (description) {
        updateData.ai_description = description;
      } else {
        strapi.log.warn(`No ai_description generated for property ${result.documentId} (saving ai_metadata only)`);
      }

      strapi.log.info(`SAVE - property ${result.documentId} payload keys: ${Object.keys(updateData).join(", ")}`);

      const updated = await strapi.db.query("api::property.property").update({
        where: { id: result.id },
        data: updateData,
      });

      strapi.log.info(
        `SAVE - property ${result.documentId} confirmed. ai_metadata present: ${Boolean((updated as any)?.ai_metadata)}, ai_description length: ${((updated as any)?.ai_description || "").length}`,
      );
      strapi.log.info(
        `AI enrichment complete for property ${result.documentId}`,
      );
    }
  },
};